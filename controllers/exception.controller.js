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

const exceptionSchema = Joi.object({
  title: Joi.string().max(255).required(),
  date: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required(), // YYYY-MM-DD
  type: Joi.string().valid('Closed', 'Custom Hours').required(),
  customOpen: Joi.string().regex(/^\d{2}:\d{2}$/).allow(null, ''),
  customClose: Joi.string().regex(/^\d{2}:\d{2}$/).allow(null, ''),
  active: Joi.boolean().default(true)
});

const getAdminExceptions = async (req, res) => {
  try {
    const exceptions = await prisma.scheduleException.findMany({
      orderBy: { date: 'asc' }
    });

    const formatted = exceptions.map(e => ({
      id: e.id,
      title: e.title,
      date: e.date.toISOString().split('T')[0],
      type: e.type,
      customOpen: formatTimeToStr(e.customOpen),
      customClose: formatTimeToStr(e.customClose),
      active: e.active,
      createdAt: e.createdAt
    }));

    return successResponse(res, 'Schedule exceptions retrieved', formatted);
  } catch (err) {
    logger.error('Error fetching exceptions:', err);
    return errorResponse(res, 'Failed to retrieve schedule exceptions', 500);
  }
};

const createException = async (req, res) => {
  const { title, date, type, customOpen, customClose, active } = req.body;
  try {
    const exception = await prisma.scheduleException.create({
      data: {
        title,
        date: new Date(date),
        type,
        customOpen: type === 'Custom Hours' ? makeTimeFromStr(customOpen) : null,
        customClose: type === 'Custom Hours' ? makeTimeFromStr(customClose) : null,
        active
      }
    });

    logger.info(`Schedule exception created: ${title} on ${date}`);
    return successResponse(res, 'Schedule exception created successfully', exception, 201);
  } catch (err) {
    logger.error('Error creating exception:', err);
    return errorResponse(res, 'Failed to create schedule exception', 500);
  }
};

const updateException = async (req, res) => {
  const { id } = req.params;
  const { title, date, type, customOpen, customClose, active } = req.body;
  try {
    const exception = await prisma.scheduleException.findUnique({
      where: { id: parseInt(id) }
    });

    if (!exception) {
      return errorResponse(res, 'Schedule exception not found', 404);
    }

    const updated = await prisma.scheduleException.update({
      where: { id: parseInt(id) },
      data: {
        title,
        date: new Date(date),
        type,
        customOpen: type === 'Custom Hours' ? makeTimeFromStr(customOpen) : null,
        customClose: type === 'Custom Hours' ? makeTimeFromStr(customClose) : null,
        active
      }
    });

    logger.info(`Schedule exception ID ${id} updated`);
    return successResponse(res, 'Schedule exception updated successfully', updated);
  } catch (err) {
    logger.error(`Error updating exception ID ${id}:`, err);
    return errorResponse(res, 'Failed to update schedule exception', 500);
  }
};

const deleteException = async (req, res) => {
  const { id } = req.params;
  try {
    const exception = await prisma.scheduleException.findUnique({
      where: { id: parseInt(id) }
    });

    if (!exception) {
      return errorResponse(res, 'Schedule exception not found', 404);
    }

    await prisma.scheduleException.delete({
      where: { id: parseInt(id) }
    });

    logger.info(`Schedule exception ID ${id} deleted`);
    return successResponse(res, 'Schedule exception deleted successfully');
  } catch (err) {
    logger.error(`Error deleting exception ID ${id}:`, err);
    return errorResponse(res, 'Failed to delete schedule exception', 500);
  }
};

module.exports = {
  exceptionSchema,
  getAdminExceptions,
  createException,
  updateException,
  deleteException
};
