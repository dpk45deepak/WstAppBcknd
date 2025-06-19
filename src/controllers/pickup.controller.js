import Pickup from '../models/Pickup.model.js';

// Create a new pickup request
const createPickup = async (req, res) => {
  try {
    const {
      pickupDate,
      wasteType,
      quantity,
      images,
      specialInstructions,
      pickupAddress
    } = req.body;

    const userId = req.user.id; // Populated by auth middleware

    // Validation
    if (!pickupDate || !wasteType || !quantity || !pickupAddress) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    if (isNaN(new Date(pickupDate))) {
      return res.status(400).json({ error: 'Invalid date format for pickupDate.' });
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number.' });
    }

    const newPickup = new Pickup({
      userId,
      pickupDate: new Date(pickupDate),
      wasteType,
      quantity,
      images,
      specialInstructions,
      pickupAddress,
      status: 'pending'
    });

    await newPickup.save();

    res.status(201).json(newPickup);
  } catch (error) {
    console.error('Error creating pickup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's pickup history
const getUserPickups = async (req, res) => {
  try {
    const userId = req.user.id;

    const pickups = await Pickup.find({ userId }).sort({ pickupDate: -1 });

    res.status(200).json(pickups);
  } catch (error) {
    console.error('Error fetching user pickups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get specific pickup details by ID
const getPickupById = async (req, res) => {
  try {
    const pickupId = req.params.id;
    const userId = req.user.id;

    const pickup = await Pickup.findOne({ _id: pickupId, userId });

    if (!pickup) {
      return res.status(404).json({ error: 'Pickup not found or unauthorized.' });
    }

    res.status(200).json(pickup);
  } catch (error) {
    console.error('Error fetching pickup by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cancel a pickup request by ID
const cancelPickup = async (req, res) => {
  try {
    const pickupId = req.params.id;
    const userId = req.user.id;

    const pickup = await Pickup.findOne({ _id: pickupId, userId });

    if (!pickup) {
      return res.status(404).json({ error: 'Pickup not found or unauthorized.' });
    }

    if (pickup.status !== 'pending') {
      return res.status(400).json({ error: `Cannot cancel a pickup with status "${pickup.status}".` });
    }

    pickup.status = 'cancelled';
    await pickup.save();

    res.status(200).json(pickup);
  } catch (error) {
    console.error('Error cancelling pickup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  createPickup,
  getUserPickups,
  getPickupById,
  cancelPickup,
};
