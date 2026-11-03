const mongoose = require('mongoose');

const policySchema = new mongoose.Schema(
  {
    policyNumber: { type: String, required: true, unique: true },
    policyholder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'InsuranceProduct', required: true },
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    renewalDate: { type: Date, required: true },
    premiumAmount: { type: Number, required: true, min: 0 },
    coverageAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['Active', 'Expired', 'Cancelled'], default: 'Active' },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Policy', policySchema);
