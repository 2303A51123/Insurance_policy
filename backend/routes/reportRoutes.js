const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { auth, allowRoles } = require('../middleware/auth');
const {
  policyRegister,
  claimsStatus,
  premiumCollection,
  claimSettlement,
} = require('../controllers/reportController');

const router = express.Router();
router.use(auth, allowRoles('admin'));
router.get('/policy-register', asyncHandler(policyRegister));
router.get('/claims-status', asyncHandler(claimsStatus));
router.get('/premium-collection', asyncHandler(premiumCollection));
router.get('/claim-settlement', asyncHandler(claimSettlement));

module.exports = router;
