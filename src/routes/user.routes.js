import express from 'express';
import { verifyToken, checkRole } from '../middlewares/auth.middleware.js';
import { getCurrentUser, updateCurrentUser, getDrivers } from '../controllers/user.controller.js';

const router = express.Router();

// @route GET /api/users/profile
router.get('/profile', verifyToken, getCurrentUser);

// @route PUT /api/users/profile
router.put('/profile', verifyToken, updateCurrentUser);

// @route GET /api/users/drivers (admin only)
router.get('/drivers', verifyToken, checkRole('admin'), getDrivers);

export default router;
