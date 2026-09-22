import express from 'express';
import { createPayment, getPaymentHistory } from '../controllers/payment.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create', verifyToken, createPayment);
router.get('/history', verifyToken, getPaymentHistory);

export default router;
