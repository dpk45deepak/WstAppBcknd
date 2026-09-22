import express from 'express';
import { verifyToken, checkRole } from '../middlewares/auth.middleware.js';
import { getCurrentUser, updateCurrentUser, getDrivers } from '../controllers/user.controller.js';

const router = express.Router();

// @route GET /api/users/profile (and /me)
router.get('/profile', verifyToken, getCurrentUser);
router.get('/me', verifyToken, getCurrentUser);

// @route PUT /api/users/profile (and /me)
router.put('/profile', verifyToken, updateCurrentUser);
router.put('/me', verifyToken, updateCurrentUser);

// @route GET /api/users/drivers (admin only)
router.get('/drivers', verifyToken, checkRole('admin'), getDrivers);

export default router;
