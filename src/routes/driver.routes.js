import express from 'express';
import {
    updateDriverLocation,
    getDriverLocation,
    getAvailableDrivers,
    removeDriverLocation
} from '../controllers/driver.controller.js';
import { verifyToken, checkRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Update or create the driver's current location (driver only)
router.post('/location', verifyToken, checkRole('driver'), updateDriverLocation);

// Remove driver's location (driver only, e.g., on logout)
router.delete('/location', verifyToken, checkRole('driver'), removeDriverLocation);

// Get the current location of a specific driver (admin, user, or driver)
router.get('/location/:driverId', verifyToken, checkRole('admin', 'user', 'driver'), getDriverLocation);

// Get all available drivers (admin, user, or driver)
router.get('/available', verifyToken, checkRole('admin', 'user', 'driver'), getAvailableDrivers);

export default router;