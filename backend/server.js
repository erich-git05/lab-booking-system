const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const reservationRoutes = require('./routes/reservations');
const equipmentRoutes = require('./routes/equipment');
const bookingRoutes = require('./routes/bookings');
const dotenv = require('dotenv');

// Load environment variables
require('dotenv').config();

// Optimize memory usage
const v8 = require('v8');
v8.setFlagsFromString('--max-old-space-size=8192');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable compression with higher level
app.use(compression({ level: 9 }));

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false
}));

// Middleware with optimized settings
app.use(express.json({ 
  limit: '5mb',
  strict: true,
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '5mb',
  parameterLimit: 1000
}));

// CORS with optimized settings
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/bookings', bookingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB with optimized settings
mongoose.connect('mongodb://localhost:27017/lab-booking-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash the server
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Give time for logging before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Handle memory warnings
process.on('warning', (warning) => {
  if (warning.name === 'ResourceExhaustedError') {
    console.warn('Memory usage warning:', warning.message);
    global.gc(); // Force garbage collection if available
  }
});
