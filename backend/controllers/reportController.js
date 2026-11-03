const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const Payment = require('../models/Payment');

async function policyRegister(req, res) {
  const policies = await Policy.find()
    .populate('policyholder', 'name')
    .populate('product', 'productName')
    .sort({ createdAt: -1 });
  return res.json(policies.map((policy) => ({
    policyNumber: policy.policyNumber,
    customerName: policy.policyholder.name,
    productName: policy.product.productName,
    premiumAmount: policy.premiumAmount,
    status: policy.status,
  })));
}

async function claimsStatus(req, res) {
  const claims = await Claim.find()
    .populate('policyholder', 'name')
    .sort({ createdAt: -1 });
  return res.json(claims.map((claim) => ({
    claimNumber: claim.claimNumber,
    customerName: claim.policyholder.name,
    claimAmount: claim.claimAmount,
    status: claim.status,
  })));
}

async function premiumCollection(req, res) {
  const payments = await Payment.find({ paymentStatus: 'Completed' })
    .populate('policy', 'policyNumber')
    .populate('policyholder', 'name')
    .sort({ paymentDate: -1 });
  return res.json(payments.map((payment) => ({
    customerName: payment.policyholder.name,
    policyNumber: payment.policy.policyNumber,
    premiumAmount: payment.amount,
    paymentDate: payment.paymentDate,
    paymentStatus: payment.paymentStatus,
  })));
}

async function claimSettlement(req, res) {
  const claims = await Claim.find({ status: { $in: ['Approved', 'Rejected', 'Settled'] } })
    .populate('policyholder', 'name')
    .sort({ updatedAt: -1 });
  return res.json(claims.map((claim) => ({
    claimNumber: claim.claimNumber,
    customerName: claim.policyholder.name,
    requestedAmount: claim.claimAmount,
    settlementAmount: claim.settlementAmount,
    settlementStatus: claim.status,
  })));
}

module.exports = { policyRegister, claimsStatus, premiumCollection, claimSettlement };
