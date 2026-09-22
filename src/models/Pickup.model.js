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

  // Feedback & rating
  rating: Number,
  feedback: String,

  // Direct address string (for frontend display)
  address: String,

  // Embedded object or string for pickup address
  pickupAddress: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id ? ret._id.toString() : undefined;
      const addrStr = typeof ret.pickupAddress === 'string' 
        ? ret.pickupAddress 
        : ret.pickupAddress && typeof ret.pickupAddress === 'object' 
          ? [ret.pickupAddress.street, ret.pickupAddress.city, ret.pickupAddress.state, ret.pickupAddress.zipCode].filter(Boolean).join(', ')
          : '';
      ret.address = ret.address || addrStr || 'Local Address';
      ret.city = ret.pickupAddress && typeof ret.pickupAddress === 'object' && ret.pickupAddress.city 
        ? ret.pickupAddress.city 
        : 'Springfield';
      ret.userName = ret.userId && typeof ret.userId === 'object' && ret.userId.name 
        ? ret.userId.name 
        : (ret.userName || 'Customer');
      ret.driverName = ret.driverId && typeof ret.driverId === 'object' && ret.driverId.name 
        ? ret.driverId.name 
        : (ret.driverName || 'Unassigned');
      ret.price = typeof ret.price === 'number' ? ret.price : 25;
      ret.distance = typeof ret.distance === 'number' ? ret.distance : 3.5;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id ? ret._id.toString() : undefined;
      const addrStr = typeof ret.pickupAddress === 'string' 
        ? ret.pickupAddress 
        : ret.pickupAddress && typeof ret.pickupAddress === 'object' 
          ? [ret.pickupAddress.street, ret.pickupAddress.city, ret.pickupAddress.state, ret.pickupAddress.zipCode].filter(Boolean).join(', ')
          : '';
      ret.address = ret.address || addrStr || 'Local Address';
      ret.city = ret.pickupAddress && typeof ret.pickupAddress === 'object' && ret.pickupAddress.city 
        ? ret.pickupAddress.city 
        : 'Springfield';
      ret.userName = ret.userId && typeof ret.userId === 'object' && ret.userId.name 
        ? ret.userId.name 
        : (ret.userName || 'Customer');
      ret.driverName = ret.driverId && typeof ret.driverId === 'object' && ret.driverId.name 
        ? ret.driverId.name 
        : (ret.driverName || 'Unassigned');
      ret.price = typeof ret.price === 'number' ? ret.price : 25;
      ret.distance = typeof ret.distance === 'number' ? ret.distance : 3.5;
      return ret;
    }
  }
});

// Pre-save hook to sync driverId, assignedDriverId, and address
pickupSchema.pre('save', function (next) {
  if (this.assignedDriverId && !this.driverId) {
    this.driverId = this.assignedDriverId;
  } else if (this.driverId && !this.assignedDriverId) {
    this.assignedDriverId = this.driverId;
  }

  if (!this.address && this.pickupAddress) {
    if (typeof this.pickupAddress === 'string') {
      this.address = this.pickupAddress;
    } else if (typeof this.pickupAddress === 'object') {
      this.address = [this.pickupAddress.street, this.pickupAddress.city, this.pickupAddress.state, this.pickupAddress.zipCode].filter(Boolean).join(', ');
    }
  } else if (this.address && !this.pickupAddress) {
    this.pickupAddress = this.address;
  }

  next();
});

const Pickup = mongoose.model('Pickup', pickupSchema);

export default Pickup;