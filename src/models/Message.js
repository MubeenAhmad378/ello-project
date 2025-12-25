const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  conversationType: {
    type: String,
    enum: ['Individual', 'Group', 'Event'],
    required: true
  },

  content: String,
  attachments: [String],

  isRead: { type: Boolean, default: false }

}, { timestamps: true });

messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
