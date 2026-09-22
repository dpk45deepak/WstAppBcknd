// Import necessary modules
import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import pickupRoutes from './pickup.routes.js';
import driverRoutes from './driver.routes.js';
import paymentRoutes from './payment.routes.js';
import adminRoutes from './admin.routes.js';

const router = express.Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes (handled by individual routers or root app)
router.use('/users', userRoutes);
router.use('/pickup', pickupRoutes);
router.use('/pickups', pickupRoutes);
router.use('/driver', driverRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);

export default router;
