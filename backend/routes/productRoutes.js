const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { auth, allowRoles } = require('../middleware/auth');
const {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const router = express.Router();

router.get('/', auth, asyncHandler(listProducts));
router.post('/', auth, allowRoles('admin'), asyncHandler(createProduct));
router.put('/:id', auth, allowRoles('admin'), asyncHandler(updateProduct));
router.delete('/:id', auth, allowRoles('admin'), asyncHandler(deleteProduct));

module.exports = router;
