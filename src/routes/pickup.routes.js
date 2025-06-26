import express from 'express';
import pickupController from '../controllers/pickup.controller.js';
import { checkRole, verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protected routes - require authentication

// Create a new pickup request
router.post('/', verifyToken, pickupController.createPickup);

// Get user's pickup history
router.get('/', verifyToken, pickupController.getUserPickups);

// Get specific pickup details by ID
router.get('/:id', verifyToken, checkRole("driver", "user", "admin"), pickupController.getPickupById);

// Cancel a pickup request by ID
router.put('/:id/cancel', verifyToken, pickupController.cancelPickup);

export default router;
