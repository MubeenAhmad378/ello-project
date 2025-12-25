const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  media: String,
  mediaType: { type: String, enum: ['Image', 'Video'], default: 'Image' },

  caption: String,
  location: String,

  visibility: {
    type: String,
    enum: ['Public', 'Followers'],
    default: 'Public'
  },

  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],

  isActive: { type: Boolean, default: true }

}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
