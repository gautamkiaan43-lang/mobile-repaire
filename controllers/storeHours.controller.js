const Joi = require('joi');
const { prisma } = require('../config/db');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');

const makeTimeFromStr = (timeStr) => {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(`1970-01-01T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00Z`);
};

const formatTimeToStr = (dateObj) => {
  if (!dateObj) return null;
  const date = new Date(dateObj);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const storeHoursUpdateSchema = Joi.array().items(Joi.object({
  dayName: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
  openTime: Joi.string().regex(/^\d{2}:\d{2}$/).required(),
  closeTime: Joi.string().regex(/^\d{2}:\d{2}$/).required(),
  breakStart: Joi.string().regex(/^\d{2}:\d{2}$/).allow(null, ''),
  breakEnd: Joi.string().regex(/^\d{2}:\d{2}$/).allow(null, ''),
  isClosed: Joi.boolean().required()
})).required();

const getStoreHours = async (req, res) => {
  try {
    const hours = await prisma.storeHour.findMany();

    // Format for easier frontend use: convert date objects back to HH:MM strings
    const formatted = hours.map(h => ({
      id: h.id,
      dayName: h.dayName,
      openTime: formatTimeToStr(h.openTime),
      closeTime: formatTimeToStr(h.closeTime),
      breakStart: formatTimeToStr(h.breakStart),
      breakEnd: formatTimeToStr(h.breakEnd),
      isClosed: h.isClosed
    }));

    return successResponse(res, 'Store hours retrieved', formatted);
  } catch (err) {
    logger.error('Error fetching store hours:', err);
    return errorResponse(res, 'Failed to retrieve store hours', 500);
  }
};

const updateStoreHours = async (req, res) => {
  const hoursData = req.body; // Array of day objects validated by schema

  try {
    // Execute updates inside transaction
    const updatedRows = await prisma.$transaction(
      hoursData.map(d => {
        return prisma.storeHour.upsert({
          where: {
            dayName: d.dayName
          },
          update: {
            openTime: makeTimeFromStr(d.openTime),
            closeTime: makeTimeFromStr(d.closeTime),
            breakStart: makeTimeFromStr(d.breakStart) || null,
            breakEnd: makeTimeFromStr(d.breakEnd) || null,
            isClosed: d.isClosed
          },
          create: {
            dayName: d.dayName,
            openTime: makeTimeFromStr(d.openTime),
            closeTime: makeTimeFromStr(d.closeTime),
            breakStart: makeTimeFromStr(d.breakStart) || null,
            breakEnd: makeTimeFromStr(d.breakEnd) || null,
            isClosed: d.isClosed
          }
        });
      })
    );

    const formatted = updatedRows.map(h => ({
      id: h.id,
      dayName: h.dayName,
      openTime: formatTimeToStr(h.openTime),
      closeTime: formatTimeToStr(h.closeTime),
      breakStart: formatTimeToStr(h.breakStart),
      breakEnd: formatTimeToStr(h.breakEnd),
      isClosed: h.isClosed
    }));

    logger.info('Store hours updated successfully');
    return successResponse(res, 'Store hours updated successfully', formatted);
  } catch (err) {
    logger.error('Error updating store hours:', err);
    return errorResponse(res, 'Failed to update store hours', 500);
  }
};

module.exports = {
  storeHoursUpdateSchema,
  getStoreHours,
  updateStoreHours
};
