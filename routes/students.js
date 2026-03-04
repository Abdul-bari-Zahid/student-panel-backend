const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const { verifyToken, isAdmin } = require('../middleware/auth');

// list with optional search
router.get('/', verifyToken, async (req, res) => {
  const q = req.query.q || '';
  const regex = new RegExp(q, 'i');
  const students = await Student.find({ $or: [{ name: regex }, { email: regex }, { phone: regex }] }).populate('subjects');
  res.json(students);
});

router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { name, email, phone, subjects } = req.body;
  const exists = await Student.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Student exists' });
  const s = new Student({ name, email, phone, subjects });
  await s.save();
  res.json(await s.populate('subjects'));
});

// public submission (no auth) - for users to submit payment screenshot etc.
router.post('/public', async (req, res) => {
  try {
    const { name, email, phone, department, semester, paymentImage } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Validation Error: Name and email are required' });
    const exists = await Student.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Duplicate Error: A student with this email already exists' });
    const s = new Student({ name, email, phone, department, semester, paymentImage, subjects: [] });
    await s.save();
    const populated = await s.populate('subjects');
    res.json(populated);
  } catch (err) {
    console.error('public submit error', err);
    res.status(500).json({
      message: 'Submission failed',
      error: err.message,
      details: err.stack,
      requestBody: { ...req.body, paymentImage: req.body.paymentImage ? 'provided (length: ' + req.body.paymentImage.length + ')' : 'missing' }
    });
  }
});

// stats for total and per-subject counts
router.get('/stats', verifyToken, async (req, res) => {
  const total = await Student.countDocuments();
  const subjects = await Subject.find();
  const counts = [];
  for (const sub of subjects) {
    const c = await Student.countDocuments({ subjects: sub._id });
    counts.push({ subject: sub.name, count: c });
  }
  res.json({ total, bySubject: counts });
});

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  console.log('PUT /students/', req.params.id);
  try {
    const { name, email, phone, subjects } = req.body;
    // prevent email duplicate
    if (email) {
      const dup = await Student.findOne({ email, _id: { $ne: req.params.id } });
      if (dup) return res.status(400).json({ message: 'Email already used by another student' });
    }
    const s = await Student.findByIdAndUpdate(req.params.id, { name, email, phone, subjects }, { new: true }).populate('subjects');
    if (!s) {
      console.log('student not found for update', req.params.id);
      return res.status(404).json({ message: 'Not found' });
    }
    res.json(s);
  } catch (err) {
    console.error('update student error', err);
    // handle validation or duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate value error' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  console.log('DELETE /students/', req.params.id);
  try {
    const s = await Student.findByIdAndDelete(req.params.id);
    if (!s) {
      console.log('student not found for delete', req.params.id);
      return res.status(404).json({ message: 'Not found' });
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('delete student error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  const s = await Student.findById(req.params.id).populate('subjects');
  if (!s) return res.status(404).json({ message: 'Not found' });
  res.json(s);
});

module.exports = router;
