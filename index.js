const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
// Temporary CORS: echo request origin so deployed frontend preflight passes.
// For production restrict this to exact origins.
const allowedOrigins = [
  'https://student-panel-frontend-sigma.vercel.app',
  'http://localhost:5173', // Vite default local
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use((req, res, next) => {
  // log for deployed debugging
  if (req.headers && req.headers.origin) {
    console.log('Incoming request origin:', req.headers.origin, req.method, req.path);
  }
  next();
});

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight for all routes
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
  })
  .catch(err => console.error(err));

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

module.exports = app;
