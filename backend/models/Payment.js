const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    policy: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
    policyholder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, default: Date.now },
    paymentStatus: { type: String, enum: ['Pending', 'Completed'], default: 'Completed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
