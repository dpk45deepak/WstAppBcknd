import mongoose from 'mongoose';

// Define the schema for the Pickup collection
const pickupSchema = new mongoose.Schema({
  userId: { // Field to store the ID of the user who requested the pickup
    type: mongoose.Schema.Types.ObjectId, // Data type is MongoDB ObjectId
    ref: 'User', // References the 'User' collection
    required: true // This field is required
  },
  pickupDate: { // Field for the scheduled pickup date
    type: Date, // Data type is Date
    required: true // This field is required
  },
  status: { // Field for the current status of the pickup request
    type: String, // Data type is String
    enum: ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled'], // Allowed values for the status
    default: 'pending' // Default status is 'pending'
  },
  wasteType: { // Field for the type of waste being picked up
    type: String, // Data type is String
    enum: ['recyclable', 'hazardous', 'organic', 'electronic', 'other', 'plastic', 'general'], // Allowed values for waste type
    required: true // This field is required
  },
  quantity: { // Field for the estimated quantity of waste in kg
    type: Number, // Data type is Number
    required: true // This field is required
  },
  images: [String], // Field to store an array of URLs to waste images
  specialInstructions: String, // Field for any special instructions for the pickup
  notes: String, // Additional notes

  // Driver assignment
  assignedDriverId: { // Field to store the ID of the driver assigned to the pickup
    type: mongoose.Schema.Types.ObjectId, // Data type is MongoDB ObjectId
    ref: 'User' // References the 'User' collection (specifically users with 'driver' role)
  },
  driverId: { // Alias/Duplicate for easier frontend integration if needed
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Payment & Pricing
  price: {
    type: Number
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },

  // Timestamps for lifecycle
  startedAt: Date,
  completedAt: Date,
  cancelledAt: Date,

  pickupAddress: { // Embedded object for the pickup address details
    street: String, // Street address
    city: String, // City
    state: String, // State
    zipCode: String, // Zip code
    coordinates: { // Embedded object for geographical coordinates
      lat: Number, // Latitude
      lng: Number // Longitude
    }
  }
}, { timestamps: true }); // Options object: timestamps adds createdAt and updatedAt fields automatically

// Pre-save hook to sync driverId and assignedDriverId if one is set
pickupSchema.pre('save', function (next) {
  if (this.assignedDriverId && !this.driverId) {
    this.driverId = this.assignedDriverId;
  } else if (this.driverId && !this.assignedDriverId) {
    this.assignedDriverId = this.driverId;
  }
  next();
});

const Pickup = mongoose.model('Pickup', pickupSchema);

export default Pickup;