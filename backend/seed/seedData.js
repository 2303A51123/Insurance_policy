require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const connectDB = require('../config/db');
const User = require('../models/User');
const InsuranceProduct = require('../models/InsuranceProduct');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const Payment = require('../models/Payment');

async function seedData() {
  await connectDB();
  if (await User.countDocuments()) {
    console.log('Sample accounts already exist. No sample data was added.');
    return;
  }

  const [admin, agent, holder, officer] = await User.create([
    { name: 'Asha Admin', email: 'admin@insurance.com', password: 'Admin@123', phone: '9000000001', role: 'admin' },
    { name: 'Arun Agent', email: 'agent@insurance.com', password: 'Agent@123', phone: '9000000002', role: 'agent' },
    { name: 'Priya Policyholder', email: 'holder@insurance.com', password: 'Holder@123', phone: '9000000003', role: 'policyholder' },
    { name: 'Ravi Claims Officer', email: 'officer@insurance.com', password: 'Officer@123', phone: '9000000004', role: 'claimsOfficer' },
  ]);
  const [health, vehicle] = await Promise.all([
    InsuranceProduct.findOneAndUpdate(
      { productName: 'Health Secure', category: 'Health' },
      { $setOnInsert: { description: 'Everyday medical expense coverage.', premiumAmount: 4500, coverageAmount: 500000 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ),
    InsuranceProduct.findOneAndUpdate(
      { productName: 'Motor Protect', category: 'Vehicle' },
      { $setOnInsert: { description: 'Simple vehicle damage protection.', premiumAmount: 3200, coverageAmount: 300000 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ),
  ]);
  const policy = await Policy.create({
    policyNumber: 'POL-DEMO-1001',
    policyholder: holder._id,
    product: health._id,
    startDate: new Date(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    premiumAmount: health.premiumAmount,
    coverageAmount: health.coverageAmount,
    agent: agent._id,
  });
  await Policy.create({
    policyNumber: 'POL-DEMO-1002',
    policyholder: holder._id,
    product: vehicle._id,
    startDate: new Date(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    premiumAmount: vehicle.premiumAmount,
    coverageAmount: vehicle.coverageAmount,
    agent: agent._id,
  });
  await Payment.create({
    policy: policy._id,
    policyholder: holder._id,
    amount: health.premiumAmount,
    paymentStatus: 'Completed',
  });
  await Claim.create({
    claimNumber: 'CLM-DEMO-1001',
    policy: policy._id,
    policyholder: holder._id,
    assignedOfficer: officer._id,
    claimAmount: 12000,
    description: 'Demonstration medical expense claim.',
    status: 'Submitted',
  });
  console.log('Sample users, products, policies, payment, and claim created.');
}

seedData()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
  });
