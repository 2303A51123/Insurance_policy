require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const ensureDefaultProducts = require('./config/defaultProducts');

const app = express();
const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = process.env.CORS_ORIGIN
  ? configuredOrigins
  : process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173'];

app.disable('x-powered-by');
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : false }));
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/policies', require('./routes/policyRoutes'));
app.use('/api/claims', require('./routes/claimRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.get('/api/health', (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ status: 'error', message: 'Database is not connected.' });
  }
  return res.json({ status: 'ok' });
});

app.use('/api', (req, res) => res.status(404).json({ message: 'API route was not found.' }));

if (process.env.FRONTEND_DIST_DIR) {
  const frontendDirectory = path.resolve(process.env.FRONTEND_DIST_DIR);
  app.use(express.static(frontendDirectory));
  app.get('*', (req, res, next) => {
    res.sendFile(path.join(frontendDirectory, 'index.html'), (error) => {
      if (error) next(error);
    });
  });
}

app.use((error, req, res, next) => {
  if (error.name === 'MulterError') {
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Document must be 5 MB or smaller.'
      : error.message;
    return res.status(400).json({ message });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'That record already exists.' });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid record ID.' });
  }
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Your session is invalid. Please log in again.' });
  }
  console.error(error);
  const status = error.statusCode || error.status || (error.message?.startsWith('Upload a ') ? 400 : 500);
  return res.status(status).json({
    message: status < 500 || process.env.NODE_ENV !== 'production'
      ? error.message || 'Something went wrong.'
      : 'Something went wrong.',
  });
});

async function startServer() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('replace-')) {
    throw new Error('Set JWT_SECRET to a private random value with at least 32 characters.');
  }
  if (process.env.NODE_ENV === 'production' && !allowedOrigins.length && !process.env.FRONTEND_DIST_DIR) {
    throw new Error('Set CORS_ORIGIN to the deployed frontend origin before starting the API in production.');
  }
  await connectDB();
  await ensureDefaultProducts();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`API listening on port ${port}`));
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = app;
