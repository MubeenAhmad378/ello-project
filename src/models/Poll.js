const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },

  options: [{
    text: String,
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],

  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  expiresAt: Date,
  isActive: { type: Boolean, default: true }

}, { timestamps: true });

module.exports = mongoose.model('Poll', pollSchema);
