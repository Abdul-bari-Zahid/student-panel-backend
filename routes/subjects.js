const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const s = await Subject.find();
  res.json(s);
});

router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { name } = req.body;
  const exists = await Subject.findOne({ name });
  if (exists) return res.status(400).json({ message: 'Subject exists' });
  const s = new Subject({ name });
  await s.save();
  res.json(s);
});

module.exports = router;
