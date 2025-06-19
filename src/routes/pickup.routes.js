import express from 'express';
import pickupController from '../controllers/pickup.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protected routes - require authentication

// Create a new pickup request
router.post('/', authMiddleware.verifyToken, pickupController.createPickup);

// Get user's pickup history
router.get('/', authMiddleware.verifyToken, pickupController.getUserPickups);

// Get specific pickup details by ID
router.get('/:id', authMiddleware.verifyToken, pickupController.getPickupById);

// Cancel a pickup request by ID
router.put('/:id/cancel', authMiddleware.verifyToken, pickupController.cancelPickup);

export default router;
