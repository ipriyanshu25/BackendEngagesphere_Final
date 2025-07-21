// models/payment.js
const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid');

/**
 * Payment Schema
 * Records PayPal order captures and links to a User (UUID format).
 * transactionId is assigned by PayPal on capture; default is empty until then.
 */
const paymentSchema = new Schema(
  {
    // Unique internal payment identifier
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => uuidv4(),
    },
    // PayPal order ID
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Transaction ID assigned by PayPal on capture
    transactionId: {
      type: String,
      default: '',
      index: true,
    },
    // UUID of the paying user
    userId: {
      type: String,
      required: true,
    },
    // Username of the paying user
    userName: {
      type: String,
      required: true,
    },
    // Payment status (defaults to CREATED)
    status: {
      type: String,
      enum: ['CREATED', 'APPROVED', 'CAPTURED', 'VOIDED', 'FAILED'],
      default: 'CREATED',
    },
    // Payer details (filled on capture)
    payerEmail: {
      type: String,
      default: '',
    },
    payerName: {
      type: String,
      default: '',
    },
    // Package details
    packageName: {
      type: String,
      required: true,
    },
    packageFeatures: {
      type: [String],
      default: [],
    },
    // Financials
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: 'USD',
    },
    // Original creation time from payment gateway or local
    create_time: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);