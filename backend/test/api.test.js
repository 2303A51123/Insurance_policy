process.env.JWT_SECRET = 'test-secret-for-insurance-api';

const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs/promises');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

let server;
let baseUrl;
let tokens;
let ids;
let uploadedDocument;

async function request(route, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.role) headers.Authorization = `Bearer ${tokens[options.role]}`;
  let body = options.body;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }
  const response = await fetch(`${baseUrl}${route}`, { ...options, headers, body });
  const data = await response.json();
  return { response, data };
}

before(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/insurance_policy_test');
  await mongoose.connection.dropDatabase();
  const [admin, agent, holder, officer] = await User.create([
    { name: 'Test Admin', email: 'admin@test.example', password: 'Admin@123', role: 'admin' },
    { name: 'Test Agent', email: 'agent@test.example', password: 'Agent@123', role: 'agent' },
    { name: 'Test Holder', email: 'holder@test.example', password: 'Holder@123', role: 'policyholder' },
    { name: 'Test Officer', email: 'officer@test.example', password: 'Officer@123', role: 'claimsOfficer' },
  ]);
  ids = { admin: admin._id.toString(), agent: agent._id.toString(), holder: holder._id.toString(), officer: officer._id.toString() };
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  if (uploadedDocument) {
    await fs.rm(path.join(__dirname, '..', uploadedDocument), { force: true });
  }
  if (server) await new Promise((resolve) => server.close(resolve));
  if (mongoose.connection.readyState) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

test('authentication, role checks, policy, claims, payments, and reports work together', async () => {
  const health = await request('/health');
  assert.equal(health.response.status, 200);
  assert.equal(health.data.status, 'ok');

  const registration = await request('/auth/register', {
    method: 'POST',
    body: { name: 'New Holder', email: 'new@test.example', password: 'Holder@123', role: 'admin' },
  });
  assert.equal(registration.response.status, 201);
  assert.equal(registration.data.user.role, 'policyholder');
  assert.equal('password' in registration.data.user, false);

  const logins = await Promise.all(['admin', 'agent', 'holder', 'officer'].map(async (role) => {
    const email = role === 'holder' ? 'holder@test.example' : `${role}@test.example`;
    const { response, data } = await request('/auth/login', {
      method: 'POST',
      body: { email, password: `${role === 'admin' ? 'Admin' : role === 'agent' ? 'Agent' : role === 'holder' ? 'Holder' : 'Officer'}@123` },
    });
    assert.equal(response.status, 200);
    return [role, data.token];
  }));
  tokens = Object.fromEntries(logins);

  const forbiddenProduct = await request('/products', {
    method: 'POST',
    role: 'holder',
    body: { productName: 'Not allowed', category: 'Health', premiumAmount: 100, coverageAmount: 1000 },
  });
  assert.equal(forbiddenProduct.response.status, 403);

  const productResult = await request('/products', {
    method: 'POST',
    role: 'admin',
    body: { productName: 'Test Health', category: 'Health', premiumAmount: 2500, coverageAmount: 250000 },
  });
  assert.equal(productResult.response.status, 201);
  const product = productResult.data;

  const policyResult = await request('/policies', {
    method: 'POST',
    role: 'agent',
    body: {
      policyholder: ids.holder,
      product: product._id,
      startDate: '2026-01-01',
      expiryDate: '2027-01-01',
    },
  });
  assert.equal(policyResult.response.status, 201);
  const policy = policyResult.data;

  const invalidPolicy = await request('/policies', {
    method: 'POST',
    role: 'agent',
    body: { policyholder: ids.holder, product: product._id, startDate: '2027-01-01', expiryDate: '2026-01-01' },
  });
  assert.equal(invalidPolicy.response.status, 400);

  const claimForm = new FormData();
  claimForm.append('policy', policy._id);
  claimForm.append('claimAmount', '12000');
  claimForm.append('description', 'Medical expense test claim');
  claimForm.append('document', new Blob(['sample document']), 'claim.pdf');
  const claimResult = await request('/claims', { method: 'POST', role: 'holder', body: claimForm });
  assert.equal(claimResult.response.status, 201);
  assert.ok(claimResult.data.document.endsWith('.pdf'));
  uploadedDocument = claimResult.data.document.replace('/uploads/', 'uploads/');
  const uploadedFile = await fetch(`${baseUrl}/claims/${claimResult.data._id}/document`, {
    headers: { Authorization: `Bearer ${tokens.holder}` },
  });
  assert.equal(uploadedFile.status, 200);
  const privateDocument = await fetch(`${baseUrl}/claims/${claimResult.data._id}/document`, {
    headers: { Authorization: `Bearer ${tokens.agent}` },
  });
  assert.equal(privateDocument.status, 403);
  const claim = claimResult.data;

  const officerClaims = await request('/claims', { role: 'officer' });
  assert.equal(officerClaims.response.status, 200);
  assert.equal(officerClaims.data.length, 1);
  const reviewed = await request(`/claims/${claim._id}/review`, {
    method: 'PATCH',
    role: 'officer',
    body: { status: 'Approved', remarks: 'Documents checked.' },
  });
  assert.equal(reviewed.response.status, 200);
  assert.equal(reviewed.data.remarks, 'Documents checked.');

  const settled = await request(`/claims/${claim._id}/review`, {
    method: 'PATCH',
    role: 'officer',
    body: { status: 'Settled', remarks: 'Paid.', settlementAmount: 10000 },
  });
  assert.equal(settled.response.status, 200);
  assert.equal(settled.data.settlementAmount, 10000);
  const reopenedClaim = await request(`/claims/${claim._id}/review`, {
    method: 'PATCH',
    role: 'officer',
    body: { status: 'Approved' },
  });
  assert.equal(reopenedClaim.response.status, 400);

  const paymentResult = await request('/payments', {
    method: 'POST',
    role: 'agent',
    body: { policy: policy._id, amount: 2500, paymentStatus: 'Completed' },
  });
  assert.equal(paymentResult.response.status, 201);
  const holderPayments = await request('/payments', { role: 'holder' });
  assert.equal(holderPayments.data.length, 1);

  const reportPaths = ['policy-register', 'claims-status', 'premium-collection', 'claim-settlement'];
  for (const reportPath of reportPaths) {
    const report = await request(`/reports/${reportPath}`, { role: 'admin' });
    assert.equal(report.response.status, 200, `${reportPath} should load`);
    assert.equal(report.data.length, 1);
  }
  const deniedReport = await request('/reports/claims-status', { role: 'agent' });
  assert.equal(deniedReport.response.status, 403);
});
