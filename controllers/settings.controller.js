const Joi = require('joi');
const { prisma } = require('../config/db');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');

const settingsSchema = Joi.object({
  storeName: Joi.string().max(255).required(),
  storeEmail: Joi.string().email().max(255).required(),
  storePhone: Joi.string().max(50).required(),
  storeAddress: Joi.string().max(500).required(),
  currency: Joi.string().max(20).required(),
  timezone: Joi.string().max(100).required(),
  bookingSlotDuration: Joi.number().integer().min(15).max(480).required()
});

const getPublicSettings = async (req, res) => {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: 1 }
    });

    if (!settings) {
      settings = {
        storeName: 'MPC Repairs',
        storeEmail: 'support@irepairexperts.com.au',
        storePhone: '+61 1300 473 724',
        storeAddress: '168 Cavendish Road, Coorparoo QLD 4151',
        currency: 'AUD ($)',
        timezone: 'Australia/Brisbane',
        bookingSlotDuration: 90
      };
    }

    const publicSettings = {
      storeName: settings.storeName,
      storeEmail: settings.storeEmail,
      storePhone: settings.storePhone,
      storeAddress: settings.storeAddress,
      currency: settings.currency,
      timezone: settings.timezone,
      bookingSlotDuration: settings.bookingSlotDuration
    };

    return successResponse(res, 'Settings retrieved successfully', publicSettings);
  } catch (err) {
    logger.error('Error fetching public settings:', err);
    return errorResponse(res, 'Failed to retrieve settings', 500);
  }
};

const getAdminSettings = async (req, res) => {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: 1 }
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 1,
          storeName: 'MPC Repairs',
          storeEmail: 'support@irepairexperts.com.au',
          storePhone: '+61 1300 473 724',
          storeAddress: '168 Cavendish Road, Coorparoo QLD 4151',
          currency: 'AUD ($)',
          timezone: 'Australia/Brisbane',
          bookingSlotDuration: 90
        }
      });
    }

    return successResponse(res, 'Settings retrieved successfully', settings);
  } catch (err) {
    logger.error('Error fetching admin settings:', err);
    return errorResponse(res, 'Failed to retrieve settings', 500);
  }
};

const updateAdminSettings = async (req, res) => {
  const {
    storeName, storeEmail, storePhone, storeAddress, currency, timezone, bookingSlotDuration
  } = req.body;

  try {
    let settings = await prisma.settings.findUnique({
      where: { id: 1 }
    });

    let updated;
    if (settings) {
      updated = await prisma.settings.update({
        where: { id: 1 },
        data: {
          storeName, storeEmail, storePhone, storeAddress, currency, timezone, bookingSlotDuration
        }
      });
    } else {
      updated = await prisma.settings.create({
        data: {
          id: 1,
          storeName, storeEmail, storePhone, storeAddress, currency, timezone, bookingSlotDuration
        }
      });
    }

    return successResponse(res, 'Settings updated successfully', updated);
  } catch (err) {
    logger.error('Error updating admin settings:', err);
    return errorResponse(res, 'Failed to update settings', 500);
  }
};

module.exports = {
  settingsSchema,
  getPublicSettings,
  getAdminSettings,
  updateAdminSettings
};
