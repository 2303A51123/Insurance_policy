const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    claimNumber: { type: String, required: true, unique: true },
    policy: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
    policyholder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    claimAmount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    document: { type: String, default: '' },
    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Settled'],
      default: 'Submitted',
    },
    remarks: { type: String, default: '' },
    settlementAmount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Claim', claimSchema);
