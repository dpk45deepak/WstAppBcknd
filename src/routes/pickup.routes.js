import express from 'express';
import pickupController from '../controllers/pickup.controller.js';
import { checkRole, verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protected routes - require authentication

// Create a new pickup request
router.post('/', verifyToken, pickupController.createPickup);

// Get all pickups (Admin only, or filtered)
router.get('/', verifyToken, checkRole('admin'), pickupController.getAllPickups);

// Get current user's pickup history
router.get('/my', verifyToken, pickupController.getUserPickups);

// Get pickups for a specific user (Admin only)
router.get('/user/:userId', verifyToken, checkRole('admin'), (req, res, next) => {
    req.query.userId = req.params.userId;
    next();
}, pickupController.getAllPickups);

// Get pickups for a specific driver
router.get('/driver/:driverId', verifyToken, pickupController.getDriverPickups);

// Get stats
router.get('/stats', verifyToken, pickupController.getPickupStats);

// Estimate price
router.post('/estimate', verifyToken, pickupController.estimatePrice);

// Get specific pickup details by ID
router.get('/:id', verifyToken, pickupController.getPickupById);

// Update pickup (General)
router.put('/:id', verifyToken, pickupController.updatePickup);

// Assign driver
router.put('/:id/assign', verifyToken, checkRole('admin'), pickupController.assignDriver);

// Start pickup (Driver)
router.put('/:id/start', verifyToken, checkRole('driver'), pickupController.startPickup);

// Complete pickup (Driver)
router.put('/:id/complete', verifyToken, checkRole('driver'), pickupController.completePickup);

// Cancel a pickup request by ID
router.put('/:id/cancel', verifyToken, pickupController.cancelPickup);

export default router;
