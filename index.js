const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs')
dotenv.config();
const app = express();
// Temporary CORS: echo request origin so deployed frontend preflight passes.
// For production restrict this to exact origins.
// Manual CORS Handling (In-order middleware)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = [
    'https://student-panel-frontend-sigma.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  // Allow if in list or if it's a vercel subdomain
  const isVercel = origin && origin.endsWith('.vercel.app');
  if (!origin || allowed.includes(origin) || isVercel) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    // If not allowed, we don't set the header, browser will block it.
    // No error thrown to avoid 500 status.
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use((req, res, next) => {
  // log for deployed debugging
  if (req.headers && req.headers.origin) {
    console.log('Incoming request origin:', req.headers.origin, req.method, req.path);
  }
  next();
});

// allow larger JSON bodies for base64 image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const PORT = process.env.PORT || 5000;

// Models
const User = require('./models/User');
const Student = require('./models/Student');
const Subject = require('./models/Subject');

// MongoDB connection helper
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    if (!process.env.MONGO_URI) {
      console.warn('MONGO_URI not found, skipping DB connection');
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log('Mongo connected');
  } catch (err) {
    console.error('Mongo connection error:', err);
  }
};

// Middleware to ensure DB connection for every request
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: isConnected,
    env: {
      MONGO: !!process.env.MONGO_URI,
      CLOUDINARY_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_KEY: !!process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_SECRET: !!process.env.CLOUDINARY_API_SECRET,
      JWT: !!process.env.JWT_SECRET
    }
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Export for Vercel
module.exports = app;

// Local development
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}
