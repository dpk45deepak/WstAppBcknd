// Import the mongoose library
import mongoose from 'mongoose';

// Define the schema for the Driver Location model
const driverLocationSchema = new mongoose.Schema({
  // Reference to the User model (specifically users with the 'driver' role)
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Refers to the User model
    required: true // Driver ID is required for each location entry
  },
  // Coordinates for the driver's location (latitude and longitude)
  coordinates: {
    lat: {
      type: Number,
      required: true // Latitude is required
    },
    lng: {
      type: Number,
      required: true // Longitude is required
    }
  },
  // Timestamp of the location update
  timestamp: {
    type: Date,
    default: Date.now // Default to the current time if not provided
  },
  // Status of the driver (e.g., available, on_route)
  status: {
    type: String,
    enum: ['available', 'on_route', 'on_pickup', 'offline'], // Allowed values for the status
    default: 'offline' // Default status is 'offline'
  }
});

// Create the Mongoose model for Driver Location using the defined schema
const DriverLocation = mongoose.model('DriverLocation', driverLocationSchema);

// Export the DriverLocation model
export default DriverLocation;
