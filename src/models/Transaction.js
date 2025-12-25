const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  amount: { type: Number, required: true },

  type: {
    type: String,
    enum: ['Credit Amount', 'Debit Amount', 'Money Withdrawn'],
    required: true
  },

  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed'],
    default: 'Pending'
  },

  withdrawMethod: { type: String, enum: ['Bank', 'Card', 'Wallet'] },

  bankName: String,
  cardNumber: { type: String, select: false },
  referenceId: String,

  transactionDate: { type: Date, default: Date.now }

}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
