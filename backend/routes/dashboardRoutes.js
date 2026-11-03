const express = require('express');
const User = require('../models/User');
const InsuranceProduct = require('../models/InsuranceProduct');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const Payment = require('../models/Payment');
const asyncHandler = require('../middleware/asyncHandler');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', auth, asyncHandler(async (req, res) => {
  const ownPolicies = req.user.role === 'policyholder' ? { policyholder: req.user._id } : {};
  const ownClaims = req.user.role === 'policyholder'
    ? { policyholder: req.user._id }
    : req.user.role === 'claimsOfficer'
      ? { assignedOfficer: req.user._id }
      : {};
  const [users, products, policies, claims, payments] = await Promise.all([
    User.countDocuments({ role: 'policyholder' }),
    InsuranceProduct.countDocuments(),
    Policy.countDocuments(ownPolicies),
    Claim.countDocuments(ownClaims),
    Payment.aggregate([
      { $match: req.user.role === 'policyholder' ? { policyholder: req.user._id } : {} },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);
  const pendingClaims = await Claim.countDocuments({ ...ownClaims, status: { $in: ['Submitted', 'Under Review'] } });
  return res.json({
    policyholders: users,
    products,
    policies,
    claims,
    pendingClaims,
    premiumCollected: payments[0]?.total || 0,
  });
}));

module.exports = router;
