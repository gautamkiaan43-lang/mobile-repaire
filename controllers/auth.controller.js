const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { prisma } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin || !admin.active) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`Admin logged in successfully: ${admin.email}`);
    
    return successResponse(res, 'Login successful', {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    });

  } catch (err) {
    logger.error('Login error:', err);
    return errorResponse(res, 'An error occurred during login', 500);
  }
};

const logout = (req, res) => {
  // Common JWT logout is stateless client-side discard.
  return successResponse(res, 'Logged out successfully');
};

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const adminId = req.admin.id; // set by verifyAdminToken middleware

  const { error } = changePasswordSchema.validate(req.body);
  if (error) {
    return errorResponse(res, error.details[0].message, 400);
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      return errorResponse(res, 'Admin user not found', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid current password', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedPassword }
    });

    logger.info(`Admin password changed successfully for admin ID: ${adminId}`);
    return successResponse(res, 'Password changed successfully');
  } catch (err) {
    logger.error('Error changing admin password:', err);
    return errorResponse(res, 'An error occurred while changing password', 500);
  }
};

module.exports = {
  loginSchema,
  login,
  logout,
  changePassword
};
