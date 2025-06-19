import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Reference to the User who made the payment
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links this payment to a User document
    required: true,
  },
  // Reference to the Waste Pickup request this payment is for
  pickupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pickup', // Links this payment to a Pickup document
    required: true,
  },
  // The amount paid
  amount: {
    type: Number,
    required: true,
    min: 0, // Ensure the amount is not negative
  },
  // The method used for payment
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'net_banking', 'upi', 'cash'],
    required: true,
  },
  // The status of the payment
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending', // Default status is pending
  },
  // Unique transaction identifier from the payment gateway
  transactionId: {
    type: String,
    required: true,
    unique: true, // Ensure transaction IDs are unique
  },
  // The date and time the payment was made
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now, // Default to the current date and time
  },
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

// Create the Payment model from the schema
const Payment = mongoose.model('Payment', paymentSchema);

// Export the model for use in other parts of the application
export default Payment;
