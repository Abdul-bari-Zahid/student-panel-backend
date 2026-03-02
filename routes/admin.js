const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.post('/add', verifyToken, isAdmin, async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email exists' });
  const hash = await bcrypt.hash(password, 10);
  const u = new User({ name, email, password: hash, role: 'admin' });
  await u.save();
  res.json({ message: 'Admin added' });
});

module.exports = router;
