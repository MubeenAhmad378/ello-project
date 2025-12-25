const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Auth
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  phoneNumber: String,
  password: {
    type: String,
    required: true,
    select: false
  },

  otp: String,
  otpExpires: Date,
  isVerified: { type: Boolean, default: false },
  
  // Basic Info
  firstName: String,
  lastName: String,
  profilePicture: String,

  photos: {
    type: [String],
    validate: [arr => arr.length <= 6, 'Maximum 6 photos allowed']
  },

  description: String,
  location: String,
  interests: [String],

  prompts: [{
    question: String,
    answer: String
  }],

  // Social
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Business & Wallet
  isBusinessAccount: { type: Boolean, default: false },
  businessName: String,
  walletBalance: { type: Number, default: 0 },

  // Security & Settings
  isVerified: { type: Boolean, default: false },
  twoStepVerification: { type: Boolean, default: false },
  faceId: { type: Boolean, default: false },

  notifications: {
    pauseAll: { type: Boolean, default: false },
    events: { type: Boolean, default: true },
    groups: { type: Boolean, default: true },
    messages: { type: Boolean, default: true }
  },

  language: { type: String, default: 'English' },
  activeStatus: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  
  refreshToken: {
    type: String,
    select: false
  }
  

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
