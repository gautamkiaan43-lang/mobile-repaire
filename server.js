const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const { prisma } = require('./config/db');
const redis = require('./config/redis');
const { successResponse, errorResponse } = require('./utils/response');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== CORS CONFIG ====================
const allowedOrigins = [
  'https://monile-reapireds.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin (Postman, Mobile Apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization'
    ]
  })
);

// Handle Preflight Requests
app.options('*', cors());

// ==================== BODY PARSER ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== REQUEST LOGGER ====================
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// ==================== RATE LIMITER ====================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

app.use(globalLimiter);

// ==================== HEALTH CHECK ====================
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    const dbStatus = 'healthy';
    const redisStatus = redis.isAvailable()
      ? 'connected'
      : 'fallback_memory';

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

// ==================== ROUTES ====================
const authRoutes = require('./routes/auth.routes');
const publicRoutes = require('./routes/public.routes');
const adminRoutes = require('./routes/admin.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/admin', adminRoutes);

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  return errorResponse(res, 'Endpoint not found', 404);
});

// ==================== GLOBAL ERROR HANDLER ====================
app.use((err, req, res, next) => {
  logger.error('Unhandled request error:', err);

  return errorResponse(
    res,
    err.message || 'Internal server error',
    err.status || 500
  );
});

// ==================== START SERVER ====================
const server = app.listen(PORT, () => {
  logger.info(`MPC Repairs Backend running on port ${PORT}`);
});

module.exports = { app, server };