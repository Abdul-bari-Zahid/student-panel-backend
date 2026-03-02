const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcrypt');

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern_admin');
  const email = process.env.PREADMIN_EMAIL || 'admin@example.com';
  const pass = process.env.PREADMIN_PASS || 'Admin@123';
  let u = await User.findOne({ email });
  if (u) {
    console.log('Admin exists:', email);
    process.exit(0);
  }
  const hash = await bcrypt.hash(pass, 10);
  u = new User({ name: 'Predefined Admin', email, password: hash, role: 'admin' });
  await u.save();
  console.log('Admin created:', email);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
