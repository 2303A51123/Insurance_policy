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

router.get('/balances', auth, allowRoles('policyholder'), asyncHandler(async (req, res) => {
  const policies = await Policy.find({ policyholder: req.user._id })
    .populate('product', 'productName')
    .sort({ createdAt: -1 });
  const completedPayments = await Payment.find({
    policyholder: req.user._id,
    paymentStatus: 'Completed',
  }).select('policy amount');
  const paidByPolicy = new Map();
  for (const payment of completedPayments) {
    const policyId = payment.policy.toString();
    paidByPolicy.set(policyId, (paidByPolicy.get(policyId) || 0) + payment.amount);
  }

  return res.json(policies.map((policy) => {
    const amountPaid = paidByPolicy.get(policy._id.toString()) || 0;
    return {
      policyId: policy._id,
      policyNumber: policy.policyNumber,
      productName: policy.product?.productName || 'Insurance policy',
      premiumAmount: policy.premiumAmount,
      amountPaid,
      remainingAmount: Math.max(policy.premiumAmount - amountPaid, 0),
    };
  }));
}));

router.post('/repay', auth, allowRoles('policyholder'), asyncHandler(async (req, res) => {
  const { policy: policyId } = req.body;
  if (!mongoose.isValidObjectId(policyId)) {
    return res.status(400).json({ message: 'Choose one of your policies.' });
  }

  const policy = await Policy.findOne({ _id: policyId, policyholder: req.user._id });
  if (!policy) {
    return res.status(404).json({ message: 'Policy was not found on your account.' });
  }

  const completedPayments = await Payment.find({
    policy: policy._id,
    paymentStatus: 'Completed',
  }).select('amount');
  const amountPaid = completedPayments.reduce((total, payment) => total + payment.amount, 0);
  const remainingAmount = Math.max(policy.premiumAmount - amountPaid, 0);
  if (remainingAmount === 0) {
    return res.status(400).json({ message: 'This policy has no remaining premium to pay.' });
  }

  const payment = await Payment.create({
    policy: policy._id,
    policyholder: req.user._id,
    amount: remainingAmount,
    paymentDate: new Date(),
    paymentStatus: 'Completed',
    paymentMethod: 'Bank transfer',
  });
  return res.status(201).json({
    message: 'Demo bank transfer recorded successfully.',
    payment,
    amountPaid: amountPaid + remainingAmount,
    remainingAmount: 0,
  });
}));

router.post('/', auth, allowRoles('admin', 'agent'), asyncHandler(async (req, res) => {
  const { policy: policyId, amount, paymentDate, paymentStatus, paymentMethod } = req.body;
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
    paymentMethod: paymentMethod || 'Bank transfer',
  });
  return res.status(201).json(payment);
}));

module.exports = router;
