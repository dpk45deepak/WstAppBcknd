import express from 'express';
import errorMiddleware from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import pickupRoutes from './routes/pickup.routes.js';
// import paymentRoutes from './routes/payment.routes.js';


const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// default route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API',
  });
})

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pickups', pickupRoutes);
// app.use('/api/payments', paymentRoutes);

// Global error handler middleware (should be last)
app.use(errorMiddleware);

export default app;
