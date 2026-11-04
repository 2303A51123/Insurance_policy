const InsuranceProduct = require('../models/InsuranceProduct');

const defaultProducts = [
  {
    productName: 'Health Secure',
    category: 'Health',
    description: 'Everyday medical expense coverage.',
    premiumAmount: 4500,
    coverageAmount: 500000,
  },
  {
    productName: 'Motor Protect',
    category: 'Vehicle',
    description: 'Simple vehicle damage protection.',
    premiumAmount: 3200,
    coverageAmount: 300000,
  },
];

async function ensureDefaultProducts() {
  if (await InsuranceProduct.exists()) return;
  await InsuranceProduct.insertMany(defaultProducts);
  console.log('Added default insurance products');
}

module.exports = ensureDefaultProducts;
