import express from 'express';
import {
  getAdminStats,
  getAdminActivities,
  getAdminPickups,
  getAdminPickupStats,
  updateAdminPickupStatus,
  getAdminDrivers,
  updateDriverAvailability,
  getAdminUsers,
  activateUser,
  suspendUser,
  deleteUser,
  bulkUserAction,
  getAdminReports,
  exportAdminReports
} from '../controllers/admin.controller.js';
import { verifyToken, checkRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Require admin role for all admin routes
router.use(verifyToken, checkRole('admin'));

// Dashboard stats & activities
router.get('/stats', getAdminStats);
router.get('/activities', getAdminActivities);

// Pickups management
router.get('/pickups', getAdminPickups);
router.get('/pickups/stats', getAdminPickupStats);
router.put('/pickups/:id/status', updateAdminPickupStatus);

// Drivers management
router.get('/drivers', getAdminDrivers);
router.put('/drivers/:id/availability', updateDriverAvailability);

// Users management
router.get('/users', getAdminUsers);
router.put('/users/:id/activate', activateUser);
router.put('/users/:id/suspend', suspendUser);
router.delete('/users/:id', deleteUser);
router.post('/users/bulk-action', bulkUserAction);

// Reports
router.get('/reports', getAdminReports);
router.post('/reports/export', exportAdminReports);

export default router;
