const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const { prisma } = require('./config/db');
const redis = require('./config/redis');
const { successResponse, errorResponse } = require('./utils/response');

require('dotenv').config();

const app = express();
app.set('trust proxy', 1); // Trust first proxy (like Railway)
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: ['https://monile-reapireds.netlify.app', 'http://localhost:5173'],
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Basic Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // increased for testing (was 100)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use(globalLimiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Ping database
    await prisma.$queryRaw`SELECT 1`;
    const dbStatus = 'healthy';
    
    // Check Redis
    const redisClient = redis.getClient();
    const redisStatus = redis.isAvailable() ? 'connected' : 'fallback_memory';

    return successResponse(res, 'Server is running', {
      status: 'OK',
      database: dbStatus,
      redis: redisStatus,
      uptime: process.uptime()
    });
  } catch (err) {
    logger.error('Health check failed:', err);
    return errorResponse(res, 'Health check failed', 500, {
      error: err.message
    });
  }
});

// Import routes
const authRoutes = require('./routes/auth.routes');
const publicRoutes = require('./routes/public.routes');
const adminRoutes = require('./routes/admin.routes');

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/admin', adminRoutes);

// Catch-all route handler for 404
app.use((req, res) => {
  return errorResponse(res, 'Endpoint not found', 404);
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error('Unhandled request error:', err);
  return errorResponse(res, err.message || 'Internal server error', err.status || 500);
});

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`MPC Repairs Backend running on port ${PORT}`);
});

module.exports = { app, server };
