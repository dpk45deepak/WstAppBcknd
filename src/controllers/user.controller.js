import User from '../models/User.model.js';

/**
 * Get current authenticated user profile
 */
export async function getCurrentUser(req, res) {
  try {
    const userId = req.user.id || req.user.userId || req.user._id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: error.message });
  }
}

/**
 * Update current authenticated user profile
 */
export async function updateCurrentUser(req, res) {
  try {
    const userId = req.user.id || req.user.userId || req.user._id;
    const { name, email, address, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (address !== undefined) {
      if (typeof address === 'string') {
        user.address = { street: address };
      } else {
        user.address = address;
      }
    }
    if (phone !== undefined) user.phone = phone;

    await user.save();
    const updatedUser = await User.findById(userId).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: error.message });
  }
}

/**
 * Get drivers (Admin only)
 */
export async function getDrivers(req, res) {
  try {
    const drivers = await User.find({ role: 'driver' }).select('-password');
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: error.message });
  }
}

export default {
  getCurrentUser,
  updateCurrentUser,
  getDrivers
};
