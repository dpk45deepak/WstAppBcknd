import express from 'express';
import { register, logout, login } from '../controllers/auth.controller.js';


const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register',register);

// POST /api/auth/login - Login user
router.post('/login',login);

// POST /api/auth/logout - Logout user
router.post('/logout',logout);

export default router;
