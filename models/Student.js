const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  department: { type: String },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  semester: { type: String },
  paymentImage: { type: String } // base64 or URL
}, { timestamps: true });

module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);
