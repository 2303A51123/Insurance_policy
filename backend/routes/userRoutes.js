const express = require('express');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { auth, allowRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, allowRoles('admin', 'agent'), asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ name: 1 });
  return res.json(users);
}));

router.post('/policyholders', auth, allowRoles('admin', 'agent'), asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and a temporary password are required.' });
  }
  const user = await User.create({ name, email, password, phone, role: 'policyholder' });
  return res.status(201).json(user);
}));

router.get('/officers', auth, allowRoles('admin', 'agent', 'claimsOfficer'), asyncHandler(async (req, res) => {
  const officers = await User.find({ role: 'claimsOfficer' }).select('name email').sort({ name: 1 });
  return res.json(officers);
}));

module.exports = router;
