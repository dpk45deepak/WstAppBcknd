import Payment from '../models/Payment.model.js';
import Pickup from '../models/Pickup.model.js';

export const createPayment = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { amount, paymentMethodId, pickupId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid payment amount' });
    }

    let targetPickup = null;
    if (pickupId) {
      targetPickup = await Pickup.findById(pickupId);
    } else {
      // Find latest pending payment pickup for this user
      targetPickup = await Pickup.findOne({ userId, paymentStatus: 'pending' }).sort({ createdAt: -1 });
    }

    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const newPayment = new Payment({
      userId,
      pickupId: targetPickup ? targetPickup._id : (userId), // fallback link
      amount: Number(amount),
      paymentMethod: 'credit_card',
      status: 'completed',
      transactionId,
      paymentDate: new Date()
    });

    await newPayment.save();

    if (targetPickup) {
      targetPickup.paymentStatus = 'paid';
      await targetPickup.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment successful',
      data: {
        transactionId,
        amount,
        status: 'completed',
        pickupId: targetPickup?._id
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ success: false, error: error.message || 'Payment processing failed' });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export default {
  createPayment,
  getPaymentHistory
};
