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
      address,
      notes
    } = req.body;

    const userId = req.user.id || req.user.userId;

    const chosenAddress = address || pickupAddress;

    // Validation
    if (!pickupDate || !wasteType || !chosenAddress) {
      return res.status(400).json({ error: 'Missing required fields (pickupDate, wasteType, address).' });
    }

    if (isNaN(new Date(pickupDate).getTime())) {
      return res.status(400).json({ error: 'Invalid date format for pickupDate.' });
    }

    const qty = Number(quantity) || 1;
    const price = qty * 10; // Mock price: $10 per unit

    const newPickup = new Pickup({
      userId,
      pickupDate: new Date(pickupDate),
      wasteType,
      quantity: qty,
      images: images || [],
      specialInstructions,
      pickupAddress: chosenAddress,
      address: typeof chosenAddress === 'string' ? chosenAddress : `${chosenAddress.street || ''}, ${chosenAddress.city || ''}`.trim(),
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
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Get user's pickup history
const getUserPickups = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { status, wasteType } = req.query;
    
    const query = { userId };
    if (status && status !== 'all') query.status = status;
    if (wasteType && wasteType !== 'all') query.wasteType = wasteType;

    const pickups = await Pickup.find(query)
      .sort({ pickupDate: -1 })
      .populate('driverId', 'name email phone');

    res.status(200).json({
      success: true,
      data: pickups
    });
  } catch (error) {
    console.error('Error fetching user pickups:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Get specific pickup details by ID
const getPickupById = async (req, res) => {
  try {
    const pickupId = req.params.id;
    const userId = req.user.id || req.user.userId;
    const userRole = req.user.role;

    let query = { _id: pickupId };

    if (userRole === 'user') {
      query.userId = userId;
    } else if (userRole === 'driver') {
      query.$or = [{ driverId: userId }, { assignedDriverId: userId }, { status: 'pending' }];
    }

    const pickup = await Pickup.findOne(query)
      .populate('userId', 'name email phone address')
      .populate('driverId', 'name email phone');

    if (!pickup) {
      return res.status(404).json({ error: 'Pickup not found or unauthorized.' });
    }

    res.status(200).json({
      success: true,
      data: pickup
    });
  } catch (error) {
    console.error('Error fetching pickup by ID:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Cancel a pickup request by ID
const cancelPickup = async (req, res) => {
  try {
    const pickupId = req.params.id;
    const userId = req.user.id || req.user.userId;
    const userRole = req.user.role;

    let query = { _id: pickupId };
    if (userRole === 'user') {
      query.userId = userId;
    }

    const pickup = await Pickup.findOne(query);

    if (!pickup) {
      return res.status(404).json({ error: 'Pickup not found or unauthorized.' });
    }

    if (pickup.status === 'completed' || pickup.status === 'cancelled') {
      return res.status(400).json({ error: `Cannot cancel a pickup with status "${pickup.status}".` });
    }

    pickup.status = 'cancelled';
    pickup.cancelledAt = new Date();
    if (req.body.reason) {
      pickup.notes = (pickup.notes ? `${pickup.notes} | ` : '') + `Cancellation reason: ${req.body.reason}`;
    }
    await pickup.save();

    res.status(200).json({
      success: true,
      data: pickup,
      message: "Pickup cancelled successfully"
    });
  } catch (error) {
    console.error('Error cancelling pickup:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Get all pickups (Admin or Driver querying available/pending)
const getAllPickups = async (req, res) => {
  try {
    const { status, wasteType, userId, driverId } = req.query;
    let query = {};

    if (status && status !== 'all') query.status = status;
    if (wasteType && wasteType !== 'all') query.wasteType = wasteType;
    if (userId) query.userId = userId;
    if (driverId) query.driverId = driverId;

    // If regular user, only show their own pickups
    if (req.user.role === 'user') {
      query.userId = req.user.id || req.user.userId;
    } else if (req.user.role === 'driver') {
      // If driver, default to pending pickups (available for pickup) or their assigned ones
      if (!status) {
        query.status = 'pending';
      }
    }

    const pickups = await Pickup.find(query)
      .sort({ pickupDate: -1 })
      .populate('userId', 'name email address phone')
      .populate('driverId', 'name email phone');

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
    const driverId = req.params.driverId || req.user.id || req.user.userId;
    const { status, wasteType } = req.query;

    if (req.user.role !== 'admin' && req.user.id !== driverId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const query = {
      $or: [{ driverId: driverId }, { assignedDriverId: driverId }]
    };

    if (status && status !== 'all') query.status = status;
    if (wasteType && wasteType !== 'all') query.wasteType = wasteType;

    const pickups = await Pickup.find(query)
      .sort({ pickupDate: 1 })
      .populate('userId', 'name address phone email');

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

    if (updates.pickupAddress && !updates.address && typeof updates.pickupAddress === 'string') {
      updates.address = updates.pickupAddress;
    }

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

// Assign driver (Claiming by driver or assignment by admin)
const assignDriver = async (req, res) => {
  try {
    const { id } = req.params;
    // If driver is calling this, assign self; if admin, use provided driverId
    const driverId = req.user.role === 'driver' 
      ? (req.user.id || req.user.userId) 
      : (req.body.driverId || req.user.id);

    const pickup = await Pickup.findByIdAndUpdate(
      id,
      {
        driverId,
        assignedDriverId: driverId,
        status: 'scheduled'
      },
      { new: true }
    ).populate('driverId', 'name email phone');

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
    if (!pickup) return res.status(404).json({ error: 'Pickup not found' });
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
      { status: 'completed', completedAt: new Date(), paymentStatus: 'paid' },
      { new: true }
    );
    if (!pickup) return res.status(404).json({ error: 'Pickup not found' });
    res.status(200).json({ success: true, data: pickup });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get stats
const getPickupStats = async (req, res) => {
  try {
    const targetUserId = req.query.userId || (req.user.role === 'user' ? req.user.id : undefined);
    const query = {};
    if (targetUserId) {
      query.userId = targetUserId;
    } else if (req.user.role === 'driver') {
      const dId = req.user.id || req.user.userId;
      query.$or = [{ driverId: dId }, { assignedDriverId: dId }];
    }

    const total = await Pickup.countDocuments(query);
    const scheduled = await Pickup.countDocuments({ ...query, status: 'scheduled' });
    const inProgress = await Pickup.countDocuments({ ...query, status: 'in_progress' });
    const completed = await Pickup.countDocuments({ ...query, status: 'completed' });
    const cancelled = await Pickup.countDocuments({ ...query, status: 'cancelled' });

    const revenue = completed * 25;
    const todayRevenue = Math.min(revenue, 75);

    res.status(200).json({
      success: true,
      data: {
        total,
        scheduled,
        inProgress,
        completed,
        cancelled,
        revenue,
        todayRevenue,
        rating: 4.9,
        activeHours: 6,
        averageCompletionTime: 35
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Estimate price
const estimatePrice = async (req, res) => {
  try {
    const { quantity, wasteType } = req.body;
    const qty = Number(quantity) || 1;
    const baseRate = wasteType === 'hazardous' ? 25 : wasteType === 'recyclable' ? 10 : 15;
    const price = qty * baseRate;

    res.status(200).json({
      success: true,
      data: {
        price,
        currency: 'USD',
        estimatedTime: 30
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Rate pickup
const ratePickup = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    const pickup = await Pickup.findByIdAndUpdate(
      id,
      { rating: Number(rating) || 5, feedback },
      { new: true }
    );

    if (!pickup) return res.status(404).json({ error: 'Pickup not found' });

    res.status(200).json({
      success: true,
      data: pickup,
      message: 'Pickup rated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload photo
const uploadPickupPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const photoUrl = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600';

    const pickup = await Pickup.findById(id);
    if (pickup) {
      pickup.images = pickup.images || [];
      pickup.images.push(photoUrl);
      await pickup.save();
    }

    res.status(200).json({
      success: true,
      data: { photoUrl }
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
  estimatePrice,
  ratePickup,
  uploadPickupPhoto
};
