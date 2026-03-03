const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET || 'change_this_secret');
    res.json({ token, user: { email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

module.exports = router;
