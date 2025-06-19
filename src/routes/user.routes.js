import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { getCurrentUser, updateCurrentUser, getDrivers } from '../controllers/user.controller.js';

const router = express.Router();

// @route GET /api/users/profile
// @description Get current user profile
// @access Private (requires JWT)
router.get('/profile', authMiddleware.verifyToken, getCurrentUser);

// @route PUT /api/users/profile
// @description Update current user profile
// @access Private (requires JWT)
router.put('/profile', authMiddleware.verifyToken, updateCurrentUser);

// @route GET /api/users/drivers
// @description Get all users with the 'driver' role
// @access Private (requires JWT and Admin role)
router.get(
  '/drivers',
  authMiddleware.verifyToken,
  authMiddleware.checkRole(['admin']),
  getDrivers
);

export default router;
