const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  bannerImage: String,
  groupName: { type: String, required: true },

  groupType: { type: String, enum: ['Public', 'Private'], default: 'Public' },
  groupCategory: String,

  maxMembers: Number,
  genderLimit: String,
  description: String,

  rules: [{
    title: String,
    description: String
  }],

  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  isActive: { type: Boolean, default: true }

}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
