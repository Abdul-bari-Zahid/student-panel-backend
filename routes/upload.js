const express = require('express');
const router = express.Router();
const { generateSignature } = require('../utils/cloudinarySignature');
const cloudinary = require('../config/cloudinary');

// Get Cloudinary upload signature (for frontend)
router.get('/signature', async (req, res) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature('mern_admin/payments', timestamp);
    res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: 'mern_admin/payments'
    });
  } catch (err) {
    console.error('signature error', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// POST upload via server (accepts base64 data URI)
router.post('/', async (req, res) => {
  try {
    // validate cloudinary configured
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    if (!cloudName || cloudName === 'panel' || cloudName === 'your_cloud_name') {
      console.error('cloudinary not configured or invalid cloud_name:', cloudName)
      return res.status(400).json({ message: 'Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in server/.env and restart the server.' })
    }

    const { paymentImage } = req.body; // expect data:image/...;base64,...
    if (!paymentImage) return res.status(400).json({ message: 'No image provided' });
    const folder = 'mern_admin/payments';
    const result = await cloudinary.uploader.upload(paymentImage, { folder });
    return res.json({ secure_url: result.secure_url });
  } catch (err) {
    console.error('server upload error', err);
    // surface Cloudinary message if present
    if (err.http_code) {
      return res.status(err.http_code).json({
        message: err.message,
        cloudinaryError: true,
        http_code: err.http_code
      });
    }
    return res.status(500).json({
      message: 'Upload failed',
      details: err.message,
      stack: err.stack
    });
  }
});

module.exports = router;
