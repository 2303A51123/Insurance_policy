const express = require('express');
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Policy = require('../models/Policy');
const asyncHandler = require('../middleware/asyncHandler');
const { auth, allowRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, asyncHandler(async (req, res) => {
  const query = req.user.role === 'policyholder' ? { policyholder: req.user._id } : {};
  const payments = await Payment.find(query)
    .populate('policy', 'policyNumber')
    .populate('policyholder', 'name')
    .sort({ paymentDate: -1 });
  return res.json(payments);
}));

router.post('/', auth, allowRoles('admin', 'agent'), asyncHandler(async (req, res) => {
  const { policy: policyId, amount, paymentDate, paymentStatus } = req.body;
  if (!mongoose.isValidObjectId(policyId)) {
    return res.status(400).json({ message: 'Choose a valid policy.' });
  }
  const policy = await Policy.findById(policyId);
  if (!policy) {
    return res.status(404).json({ message: 'Policy was not found.' });
  }
  const payment = await Payment.create({
    policy: policy._id,
    policyholder: policy.policyholder,
    amount: amount || policy.premiumAmount,
    paymentDate: paymentDate || new Date(),
    paymentStatus: paymentStatus || 'Completed',
  });
  return res.status(201).json(payment);
}));

module.exports = router;
