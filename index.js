const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const corsOptions = {
  origin: [
    'https://student-panel-frontend-sigma.vercel.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Ensure CORS middleware is applied globally before routes
app.use(cors(corsOptions));
// allow larger JSON bodies for base64 image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const PORT = process.env.PORT || 5000;

// Models
const User = require('./models/User');
const Student = require('./models/Student');
const Subject = require('./models/Subject');

// Routes
app.get('/', (req, res) => {
  res.send('Student Admin API is running');
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern_admin')
  .then(() => {
    console.log('Mongo connected');
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch(err => console.error(err));
