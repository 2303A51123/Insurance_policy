const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { auth, allowRoles } = require('../middleware/auth');

const router = express.Router();
const uploadFolder = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadFolder,
  filename(req, file, done) {
    const extension = path.extname(file.originalname).toLowerCase();
    done(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  },
});
const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx'];
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, done) {
    if (!allowedExtensions.includes(path.extname(file.originalname).toLowerCase())) {
      return done(new Error('Upload a PDF, image, or Word document.'));
    }
    return done(null, true);
  },
});

router.get('/', auth, asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === 'policyholder') query.policyholder = req.user._id;
  if (req.user.role === 'claimsOfficer') query.assignedOfficer = req.user._id;
  const claims = await Claim.find(query)
    .populate('policy', 'policyNumber')
    .populate('policyholder', 'name email')
    .populate('assignedOfficer', 'name email')
    .sort({ createdAt: -1 });
  return res.json(claims);
}));

router.get('/:id/document', auth, asyncHandler(async (req, res, next) => {
  const claim = await Claim.findById(req.params.id);
  if (!claim || !claim.document) {
    return res.status(404).json({ message: 'Claim document was not found.' });
  }
  const ownsClaim = claim.policyholder.equals(req.user._id);
  const isAssignedOfficer = claim.assignedOfficer?.equals(req.user._id);
  if (req.user.role !== 'admin' && !ownsClaim && !isAssignedOfficer) {
    return res.status(403).json({ message: 'You do not have permission to view this document.' });
  }
  return res.sendFile(path.join(uploadFolder, path.basename(claim.document)), (error) => {
    if (error) next(error);
  });
}));

router.post('/', auth, allowRoles('policyholder'), upload.single('document'), asyncHandler(async (req, res) => {
  const { policy: policyId, claimAmount, description } = req.body;
  if (!mongoose.isValidObjectId(policyId) || !claimAmount || !description) {
    return res.status(400).json({ message: 'Choose a policy and enter the amount and description.' });
  }
  const policy = await Policy.findOne({ _id: policyId, policyholder: req.user._id });
  if (!policy) {
    return res.status(404).json({ message: 'Your policy was not found.' });
  }
  const officer = await User.findOne({ role: 'claimsOfficer' }).sort({ createdAt: 1 });
  const claim = await Claim.create({
    claimNumber: `CLM-${Date.now()}`,
    policy: policy._id,
    policyholder: req.user._id,
    claimAmount: Number(claimAmount),
    description,
    document: req.file ? `/uploads/${req.file.filename}` : '',
    assignedOfficer: officer?._id,
  });
  return res.status(201).json(claim);
}));

router.patch('/:id/review', auth, allowRoles('claimsOfficer', 'admin'), asyncHandler(async (req, res) => {
  const { status, remarks, settlementAmount } = req.body;
  if (!['Under Review', 'Approved', 'Rejected', 'Settled'].includes(status)) {
    return res.status(400).json({ message: 'Choose a valid claim status.' });
  }
  const claim = await Claim.findById(req.params.id);
  if (!claim) {
    return res.status(404).json({ message: 'Claim was not found.' });
  }
  const allowedTransitions = {
    Submitted: ['Under Review', 'Approved', 'Rejected'],
    'Under Review': ['Approved', 'Rejected'],
    Approved: ['Settled'],
  };
  if (!allowedTransitions[claim.status]?.includes(status)) {
    return res.status(400).json({ message: `A ${claim.status.toLowerCase()} claim cannot be changed to ${status.toLowerCase()}.` });
  }
  if (status === 'Settled') {
    if (settlementAmount === undefined || Number(settlementAmount) < 0) {
      return res.status(400).json({ message: 'Enter a valid settlement amount.' });
    }
    claim.settlementAmount = Number(settlementAmount);
  }
  claim.status = status;
  claim.remarks = remarks || '';
  if (req.user.role === 'claimsOfficer') claim.assignedOfficer = req.user._id;
  await claim.save();
  return res.json(claim);
}));

router.patch('/:id/assign', auth, allowRoles('admin'), asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.body.assignedOfficer)) {
    return res.status(400).json({ message: 'Choose a valid claims officer.' });
  }
  const officer = await User.findOne({ _id: req.body.assignedOfficer, role: 'claimsOfficer' });
  if (!officer) {
    return res.status(404).json({ message: 'Claims officer was not found.' });
  }
  const claim = await Claim.findByIdAndUpdate(
    req.params.id,
    { assignedOfficer: officer._id },
    { new: true }
  );
  if (!claim) {
    return res.status(404).json({ message: 'Claim was not found.' });
  }
  return res.json(claim);
}));

module.exports = router;
