const mongoose = require('mongoose');

const insuranceProductSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    premiumAmount: { type: Number, required: true, min: 0 },
    coverageAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InsuranceProduct', insuranceProductSchema);
