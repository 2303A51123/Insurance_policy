const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, default: '' },
    role: {
      type: String,
      enum: ['admin', 'agent', 'policyholder', 'claimsOfficer'],
      default: 'policyholder',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.set('toJSON', {
  transform(document, result) {
    delete result.password;
    return result;
  },
});

module.exports = mongoose.model('User', userSchema);
