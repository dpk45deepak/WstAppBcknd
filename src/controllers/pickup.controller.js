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
      pickupAddress,
      notes
    } = req.body;

    const userId = req.user.id; // Populated by auth middleware

    // Validation
    if (!pickupDate || !wasteType || !quantity || !pickupAddress) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    if (isNaN(new Date(pickupDate))) {
      return res.status(400).json({ error: 'Invalid date format for pickupDate.' });
    }

    // Mock price calculation
    const price = quantity * 10; // Simple mock logic: $10 per unit

    const newPickup = new Pickup({
      userId,
      pickupDate: new Date(pickupDate),
      wasteType,
      quantity,
      images,
      specialInstructions,
      pickupAddress,
      notes,
      price,
      status: 'pending'
    });

    await newPickup.save();

    res.status(201).json({
      success: true,
      data: newPickup,
      message: "Pickup scheduled successfully"
    });
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

    res.status(200).json({
      success: true,
      data: pickups
    });
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
    const userRole = req.user.role;

    let query = { _id: pickupId };

    // If not admin, restrict access
    if (userRole === 'user') {
      query.userId = userId;
    } else if (userRole === 'driver') {
      // Drivers can see pickups assigned to them OR available pickups (if we had that logic)
      // For now, let's allow drivers to see any pickup they are assigned to
      query.$or = [{ driverId: userId }, { assignedDriverId: userId }];
    }

    // Admin can see any pickup, so no extra filter needed for admin

    const pickup = await Pickup.findOne(query).populate('userId', 'name email').populate('driverId', 'name email');

    if (!pickup) {
      // If not found with the query, it might exist but user is unauthorized
      // But for simplicity, we return 404
      return res.status(404).json({ error: 'Pickup not found or unauthorized.' });
    }

    res.status(200).json({
      success: true,
      data: pickup
    });
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

    if (pickup.status !== 'pending' && pickup.status !== 'scheduled') {
      return res.status(400).json({ error: `Cannot cancel a pickup with status "${pickup.status}".` });
    }

    pickup.status = 'cancelled';
    pickup.cancelledAt = new Date();
    await pickup.save();

    res.status(200).json({
      success: true,
      data: pickup,
      message: "Pickup cancelled successfully"
    });
  } catch (error) {
    console.error('Error cancelling pickup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- NEW METHODS ---

// Get all pickups (Admin)
const getAllPickups = async (req, res) => {
  try {
    const { status, wasteType, userId, driverId } = req.query;
    let query = {};

    if (status && status !== 'all') query.status = status;
    if (wasteType && wasteType !== 'all') query.wasteType = wasteType;
    if (userId) query.userId = userId;
    if (driverId) query.driverId = driverId;

    const pickups = await Pickup.find(query)
      .sort({ pickupDate: -1 })
      .populate('userId', 'name email')
      .populate('driverId', 'name email');

    res.status(200).json({
      success: true,
      data: pickups
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get pickups assigned to a driver
const getDriverPickups = async (req, res) => {
  try {
    const driverId = req.params.driverId || req.user.id;
    // Ensure only the driver themselves or admin can access
    if (req.user.role !== 'admin' && req.user.id !== driverId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const pickups = await Pickup.find({
      $or: [{ driverId: driverId }, { assignedDriverId: driverId }]
    }).sort({ pickupDate: 1 }).populate('userId', 'name address');

    res.status(200).json({
      success: true,
      data: pickups
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update pickup (General)
const updatePickup = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const pickup = await Pickup.findByIdAndUpdate(id, updates, { new: true });

    if (!pickup) return res.status(404).json({ error: 'Pickup not found' });

    res.status(200).json({
      success: true,
      data: pickup,
      message: "Pickup updated successfully"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Assign driver
const assignDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    const pickup = await Pickup.findByIdAndUpdate(
      id,
      {
        driverId,
        assignedDriverId: driverId,
        status: 'scheduled'
      },
      { new: true }
    ).populate('driverId', 'name');

    if (!pickup) return res.status(404).json({ error: 'Pickup not found' });

    res.status(200).json({
      success: true,
      data: pickup,
      message: "Driver assigned successfully"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Start pickup
const startPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await Pickup.findByIdAndUpdate(
      id,
      { status: 'in_progress', startedAt: new Date() },
      { new: true }
    );
    res.status(200).json({ success: true, data: pickup });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Complete pickup
const completePickup = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await Pickup.findByIdAndUpdate(
      id,
      { status: 'completed', completedAt: new Date(), paymentStatus: 'paid' }, // Assume paid on completion for now
      { new: true }
    );
    res.status(200).json({ success: true, data: pickup });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get stats
const getPickupStats = async (req, res) => {
  try {
    const total = await Pickup.countDocuments();
    const scheduled = await Pickup.countDocuments({ status: 'scheduled' });
    const inProgress = await Pickup.countDocuments({ status: 'in_progress' });
    const completed = await Pickup.countDocuments({ status: 'completed' });
    const cancelled = await Pickup.countDocuments({ status: 'cancelled' });

    // Mock revenue
    const revenue = completed * 10;

    res.status(200).json({
      success: true,
      data: {
        total,
        scheduled,
        inProgress,
        completed,
        cancelled,
        revenue
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Estimate price
const estimatePrice = async (req, res) => {
  try {
    const { quantity } = req.body;
    const price = (quantity || 1) * 10;
    res.status(200).json({
      success: true,
      data: {
        price,
        currency: 'USD',
        estimatedTime: 30 // minutes
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  createPickup,
  getUserPickups,
  getPickupById,
  cancelPickup,
  getAllPickups,
  getDriverPickups,
  updatePickup,
  assignDriver,
  startPickup,
  completePickup,
  getPickupStats,
  estimatePrice
};
