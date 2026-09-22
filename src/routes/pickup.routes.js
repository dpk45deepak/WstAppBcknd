import express from 'express';
import pickupController from '../controllers/pickup.controller.js';
import { checkRole, verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protected routes - require authentication

// Create a new pickup request
router.post('/', verifyToken, pickupController.createPickup);

// Get all pickups (Role-scoped: Admin gets all, Driver gets available, User gets own)
router.get('/', verifyToken, pickupController.getAllPickups);

// Get current user's pickup history
router.get('/my', verifyToken, pickupController.getUserPickups);

// Get pickups for a specific user (Admin only)
router.get('/user/:userId', verifyToken, checkRole('admin'), (req, res, next) => {
  req.query.userId = req.params.userId;
  next();
}, pickupController.getAllPickups);

// Get pickups for a specific driver
router.get('/driver/:driverId', verifyToken, checkRole('admin', 'driver'), pickupController.getDriverPickups);

// Get stats
router.get('/stats', verifyToken, pickupController.getPickupStats);

// Estimate price
router.post('/estimate', verifyToken, pickupController.estimatePrice);

// Get specific pickup details by ID
router.get('/:id', verifyToken, pickupController.getPickupById);

// Update pickup (General)
router.put('/:id', verifyToken, pickupController.updatePickup);

// Assign driver (Admin assigning or Driver claiming)
router.put('/:id/assign', verifyToken, checkRole('admin', 'driver'), pickupController.assignDriver);

// Start pickup (Driver)
router.put('/:id/start', verifyToken, checkRole('driver'), pickupController.startPickup);

// Complete pickup (Driver)
router.put('/:id/complete', verifyToken, checkRole('driver'), pickupController.completePickup);

// Update pickup status (Generic)
router.put('/:id/status', verifyToken, (req, res, next) => {
  const { status } = req.body;
  if (status === 'in_progress') return pickupController.startPickup(req, res);
  if (status === 'completed') return pickupController.completePickup(req, res);
  if (status === 'cancelled') return pickupController.cancelPickup(req, res);
  return pickupController.updatePickup(req, res);
});

// Cancel a pickup request by ID
router.put('/:id/cancel', verifyToken, pickupController.cancelPickup);

// Rate a pickup
router.post('/:id/rate', verifyToken, pickupController.ratePickup);

// Upload photo for pickup
router.post('/:id/photo', verifyToken, pickupController.uploadPickupPhoto);

export default router;
