const express = require('express');
const mongoose = require('mongoose');
const Policy = require('../models/Policy');
const User = require('../models/User');
const InsuranceProduct = require('../models/InsuranceProduct');
const asyncHandler = require('../middleware/asyncHandler');
const { auth, allowRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, asyncHandler(async (req, res) => {
  const query = req.user.role === 'policyholder' ? { policyholder: req.user._id } : {};
  const policies = await Policy.find(query)
    .populate('policyholder', 'name email phone')
    .populate('product', 'productName category')
    .sort({ createdAt: -1 });
  return res.json(policies);
}));

router.post('/', auth, allowRoles('admin', 'agent'), asyncHandler(async (req, res) => {
  const { policyholder, product, startDate, expiryDate } = req.body;
  if (!mongoose.isValidObjectId(policyholder) || !mongoose.isValidObjectId(product)) {
    return res.status(400).json({ message: 'Choose a valid policyholder and product.' });
  }
  const [holder, productInfo] = await Promise.all([
    User.findById(policyholder),
    InsuranceProduct.findById(product),
  ]);
  if (!holder || holder.role !== 'policyholder') {
    return res.status(400).json({ message: 'Selected account is not a policyholder.' });
  }
  if (!productInfo) {
    return res.status(404).json({ message: 'Product was not found.' });
  }

  const start = startDate ? new Date(startDate) : new Date();
  const expiry = expiryDate ? new Date(expiryDate) : new Date(start);
  if (!expiryDate) expiry.setFullYear(expiry.getFullYear() + 1);
  if (Number.isNaN(start.getTime()) || Number.isNaN(expiry.getTime()) || expiry <= start) {
    return res.status(400).json({ message: 'Expiry date must be after the start date.' });
  }
  const policy = await Policy.create({
    policyNumber: `POL-${Date.now()}`,
    policyholder,
    product,
    startDate: start,
    expiryDate: expiry,
    renewalDate: expiry,
    premiumAmount: productInfo.premiumAmount,
    coverageAmount: productInfo.coverageAmount,
    agent: req.user.role === 'agent' ? req.user._id : undefined,
  });
  return res.status(201).json(policy);
}));

module.exports = router;
