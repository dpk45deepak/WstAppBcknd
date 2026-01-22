import express from 'express';
import cors from "cors";
import morgan from "morgan";
import errorMiddleware from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import pickupRoutes from './routes/pickup.routes.js';
import driverRoutes from './routes/driver.routes.js';
// import paymentRoutes from './routes/payment.routes.js';


import "../ping.js"


const app = express();

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        "http://localhost:5173",
        "https://wstapp.netlify.app"
      ];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.options("*", cors());


// HTTP request logger middleware
app.use(morgan("dev"));

// Middleware to parse JSON requests
app.use(express.json());
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start}ms)`
    );
  });
  next();
});

// default route
app.get('/', (req, res) => {
  res.json({
    message: 'WstApp Backend is running',
    status: 200,
    author: "Deepak Kumar",
    requestedAt: new Date().toISOString().split('T'),
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the WstApp API',
    status: 200,
    author: "Deepak Kumar",
    requestedAt: new Date().toISOString().split('T'),
  });
})

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});


// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pickup', pickupRoutes);
app.use('/api/pickups', pickupRoutes);
app.use("/api/driver", driverRoutes);
// app.use('/api/payments', paymentRoutes);

// Global error handler middleware (should be last)
app.use(errorMiddleware);

export default app;
