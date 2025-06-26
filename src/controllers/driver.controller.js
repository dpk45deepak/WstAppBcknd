import DriverLocation from '../models/DriverLocation.model.js';

// Update or create the driver's current location
export const updateDriverLocation = async (req, res) => {
    try {
        const driverId = req.user.id;
        const { lat, lng, status } = req.body;

        if (typeof lat !== 'number' || typeof lng !== 'number') {
            return res.status(400).json({ message: 'Latitude and longitude are required and must be numbers.' });
        }

        // Upsert: update if exists, otherwise create
        const location = await DriverLocation.findOneAndUpdate(
            { driverId },
            {
                coordinates: { lat, lng },
                status: status || 'available',
                timestamp: new Date()
            },
            { new: true, upsert: true }
        );

        res.status(200).json(location);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get the current location of a specific driver
export const getDriverLocation = async (req, res) => {
    try {
        const { driverId } = req.params;
        const location = await DriverLocation.findOne({ driverId }).populate('driverId', 'name email');
        if (!location) {
            return res.status(404).json({ message: 'Driver location not found.' });
        }
        res.status(200).json(location);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all online/available drivers (optionally filter by status)
export const getAvailableDrivers = async (req, res) => {
    try {
        const { status } = req.query; // e.g., ?status=available
        const filter = status ? { status } : { status: { $ne: 'offline' } };
        const drivers = await DriverLocation.find(filter).populate('driverId', 'name email');
        res.status(200).json(drivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove a driver's location (e.g., when driver logs out)
export const removeDriverLocation = async (req, res) => {
    try {
        const driverId = req.user.id;
        const result = await DriverLocation.findOneAndDelete({ driverId });
        if (!result) {
            return res.status(404).json({ message: 'Driver location not found.' });
        }
        res.status(200).json({ message: 'Driver location removed.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};