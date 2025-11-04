
const mongoose = require('mongoose');

const PendingUserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, enum: ['farmer', 'business'] },
  verificationToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '1h' } // Automatically delete after 1 hour
});

module.exports = mongoose.model('PendingUser', PendingUserSchema);
