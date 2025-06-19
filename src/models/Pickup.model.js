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
    enum: ['pending', 'scheduled', 'completed', 'cancelled'], // Allowed values for the status
    default: 'pending' // Default status is 'pending'
  },
  wasteType: { // Field for the type of waste being picked up
    type: String, // Data type is String
    enum: ['recyclable', 'hazardous', 'organic', 'electronic', 'other'], // Allowed values for waste type
    required: true // This field is required
  },
  quantity: { // Field for the estimated quantity of waste in kg
    type: Number, // Data type is Number
    required: true // This field is required
  },
  images: [String], // Field to store an array of URLs to waste images
  specialInstructions: String, // Field for any special instructions for the pickup
  assignedDriverId: { // Field to store the ID of the driver assigned to the pickup
    type: mongoose.Schema.Types.ObjectId, // Data type is MongoDB ObjectId
    ref: 'User' // References the 'User' collection (specifically users with 'driver' role)
  },
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


const Pickup = mongoose.model('Pickup', pickupSchema);

export default Pickup;