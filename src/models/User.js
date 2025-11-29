const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  phone:    { type: String },
  gender:   { type: String, enum: ['male', 'female', 'other'], default: null },
  age:      { type: Number, min: 0 },
  address:  { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
