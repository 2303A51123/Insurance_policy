const InsuranceProduct = require('../models/InsuranceProduct');
const Policy = require('../models/Policy');

async function listProducts(req, res) {
  const products = await InsuranceProduct.find().sort({ productName: 1 });
  return res.json(products);
}

async function createProduct(req, res) {
  const product = await InsuranceProduct.create(req.body);
  return res.status(201).json(product);
}

async function updateProduct(req, res) {
  const product = await InsuranceProduct.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    return res.status(404).json({ message: 'Product was not found.' });
  }
  return res.json(product);
}

async function deleteProduct(req, res) {
  const policyExists = await Policy.exists({ product: req.params.id });
  if (policyExists) {
    return res.status(400).json({ message: 'A product used by a policy cannot be deleted.' });
  }
  const product = await InsuranceProduct.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product was not found.' });
  }
  return res.json({ message: 'Product deleted.' });
}

module.exports = { listProducts, createProduct, updateProduct, deleteProduct };
