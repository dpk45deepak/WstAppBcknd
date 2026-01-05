import express from 'express';
import errorMiddleware from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import pickupRoutes from './routes/pickup.routes.js';
import driverRoutes from './routes/driver.routes.js';
// import paymentRoutes from './routes/payment.routes.js';


const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// default route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the WstApp API',
    status: 200,
    author: "Deepak Kumar",
    requestedAt: new Date().toISOString().split('T'),
  });
})

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pickup', pickupRoutes);
app.use("/api/driver", driverRoutes);
// app.use('/api/payments', paymentRoutes);

// Global error handler middleware (should be last)
app.use(errorMiddleware);

export default app;
