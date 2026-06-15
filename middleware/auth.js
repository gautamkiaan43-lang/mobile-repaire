const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');
const logger = require('../utils/logger');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'mpc_repairs_secret_key_123';

const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Access denied. No authentication token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    logger.warn('Failed admin JWT verification attempt:', err.message);
    return errorResponse(res, 'Invalid or expired authentication token.', 401);
  }
};

module.exports = {
  verifyAdminToken,
  JWT_SECRET
};
