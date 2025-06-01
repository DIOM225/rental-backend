const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  profilePic: { type: String },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  approved: { type: Boolean, default: false } // 🔥 NEW FIELD
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
