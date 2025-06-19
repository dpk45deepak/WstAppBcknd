// Import necessary modules
import express from 'express'; // Express framework
import authRoutes from './auth.routes.js'; // Authentication routes
import userRoutes from './user.routes.js'; // User-related routes
import pickupRoutes from './pickup.routes.js'; // Pickup request routes
// import paymentRoutes from './payment.routes.js'; // Payment routes
// import trackingRoutes from './tracking.routes.js'; // Tracking routes

import authMiddleware from '../middlewares/auth.middleware.js'; // Authentication middleware


const router = express.Router(); // Express router for defining routes

router.use('/auth', authRoutes); // All /auth/* routes are public

router.use(authMiddleware.verifyToken); // Protect all routes below

// Define protected routes (require authentication)
router.use('/users', userRoutes); 
router.use('/pickups', pickupRoutes);  
// router.use('/payments', paymentRoutes); 
router.use('/tracking', trackingRoutes); 

// Export router
export default router;
