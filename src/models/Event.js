const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  bannerImage: String,
  eventName: { type: String, required: true },
  coHost: String,

  startDateAndTime: { type: Date, required: true },
  endDateAndTime: { type: Date, required: true },

  eventType: { type: String, enum: ['Public', 'Private'], default: 'Public' },
  eventCategory: String,

  paidEvent: { type: Boolean, default: false },
  price: { type: Number, default: 0 },

  maxMembers: Number,
  genderLimit: String,

  venue: String,
  location: String,
  description: String,

  eventStatus: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed'],
    default: 'Upcoming'
  },

  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  attendees: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    }
  }],

  isActive: { type: Boolean, default: true }

}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
