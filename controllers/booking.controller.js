const Joi = require('joi');
const { prisma } = require('../config/db');
const { getAvailableSlots } = require('../services/slotCalculator');
const { acquireLock, releaseLock } = require('../services/lockManager');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');

// Validation schema for creating a booking
const createBookingSchema = Joi.object({
  customerName: Joi.string().max(255).required(),
  customerPhone: Joi.string().pattern(/^[+]?[\d\s-]{8,20}$/).required(),
  customerEmail: Joi.string().email().max(255).required(),
  deviceBrand: Joi.string().max(100).required(),
  deviceType: Joi.string().max(100).required(),
  deviceModel: Joi.string().max(255).required(),
  repairName: Joi.string().max(255).required(),
  partQuality: Joi.string().max(255).allow(null, ''),
  finalPrice: Joi.number().precision(2).required(),
  repairSnapshot: Joi.object().required(),
  dateStr: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required(), // YYYY-MM-DD
  timeSlot: Joi.string().max(20).required(),
  notes: Joi.string().allow(null, ''),
  createdSource: Joi.string().valid('website', 'admin').default('website')
});

// Helper: check if date is valid
const isValidDate = (dStr) => {
  const d = new Date(dStr);
  return !isNaN(d.getTime());
};

/**
 * Public: GET /api/v1/public/slots
 */
const getPublicSlots = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return errorResponse(res, 'The date (YYYY-MM-DD) query parameter is required.', 400);
  }

  try {
    const slots = await getAvailableSlots(date);
    return successResponse(res, 'Slots retrieved successfully', { slots });
  } catch (err) {
    logger.error('Error fetching public slots:', err);
    return errorResponse(res, err.message || 'Failed to fetch slots', 500);
  }
};

/**
 * Public: POST /api/v1/public/bookings
 */
const createPublicBooking = async (req, res) => {
  const {
    customerName, customerPhone, customerEmail,
    deviceBrand, deviceType, deviceModel,
    repairName, partQuality, finalPrice, repairSnapshot,
    dateStr, timeSlot, notes, createdSource
  } = req.body;

  // 1. Acquire slot lock to prevent double booking race condition
  const lockAcquired = await acquireLock(dateStr, timeSlot);
  if (!lockAcquired) {
    return errorResponse(res, 'This time slot is temporarily locked or has just been booked. Please choose another slot.', 409);
  }

  try {
    // 2. Verify slot is still available (re-calculate on DB to prevent race condition)
    const available = await getAvailableSlots(dateStr);
    if (!available.includes(timeSlot)) {
      await releaseLock(dateStr, timeSlot);
      return errorResponse(res, 'The selected time slot is no longer available. Please select another slot.', 400);
    }

    // 3. Create booking inside database transaction
    const targetDate = new Date(dateStr);
    const booking = await prisma.$transaction(async (tx) => {
      // Create with TEMP placeholder for bookingNumber
      const created = await tx.booking.create({
        data: {
          bookingNumber: 'TEMP',
          customerName,
          customerPhone,
          customerEmail,
          deviceBrand,
          deviceType,
          deviceModel,
          repairName,
          partQuality: partQuality || null,
          finalPrice,
          repairSnapshot,
          dateStr: targetDate,
          timeSlot,
          status: 'Pending',
          notes: notes || null,
          createdSource: createdSource || 'website'
        }
      });

      // Update with final BKG format (e.g. BKG-0042)
      const updated = await tx.booking.update({
        where: { id: created.id },
        data: {
          bookingNumber: `BKG-${String(created.id).padStart(4, '0')}`
        }
      });

      return updated;
    });

    // 4. Release lock after successful creation
    await releaseLock(dateStr, timeSlot);

    // 5. Create notifications row for admin dashboard bell icon (only for website bookings, not admin)
    if (booking.createdSource !== 'admin') {
      await prisma.notification.create({
        data: {
          title: `New Booking #${booking.bookingNumber}`,
          description: `${customerName} booked ${deviceModel} (${repairName}) at ${timeSlot}`,
          type: 'booking',
          bookingId: booking.id,
          isRead: false
        }
      });
    }

    logger.info(`Booking created successfully: ${booking.bookingNumber}`);
    return successResponse(res, 'Booking created successfully', booking, 201);

  } catch (err) {
    // Release lock on error
    await releaseLock(dateStr, timeSlot);
    logger.error('Error creating booking:', err);
    return errorResponse(res, err.message || 'Failed to create booking', 500);
  }
};

/**
 * Admin: GET /admin/bookings (paginated + search + filters)
 */
const getAdminBookings = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    startDate,
    endDate
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Construct filters
  const where = {};

  if (status) {
    where.status = status;
  }

  if (startDate && isValidDate(startDate)) {
    where.dateStr = where.dateStr || {};
    where.dateStr.gte = new Date(startDate);
  }

  if (endDate && isValidDate(endDate)) {
    where.dateStr = where.dateStr || {};
    where.dateStr.lte = new Date(endDate);
  }

  if (search) {
    where.OR = [
      { bookingNumber: { contains: search } },
      { customerName: { contains: search } },
      { customerPhone: { contains: search } },
      { customerEmail: { contains: search } },
      { deviceModel: { contains: search } }
    ];
  }

  try {
    const [bookings, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where })
    ]);

    return successResponse(res, 'Bookings retrieved successfully', {
      bookings,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (err) {
    logger.error('Error fetching admin bookings:', err);
    return errorResponse(res, 'Failed to retrieve bookings', 500);
  }
};

/**
 * Admin: GET /admin/bookings/calendar
 */
const getAdminBookingsCalendar = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return errorResponse(res, 'Both startDate and endDate are required parameters.', 400);
  }

  try {
    const where = {
      dateStr: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { dateStr: 'asc' }
    });

    return successResponse(res, 'Calendar bookings retrieved successfully', bookings);
  } catch (err) {
    logger.error('Error fetching calendar bookings:', err);
    return errorResponse(res, 'Failed to retrieve calendar bookings', 500);
  }
};

/**
 * Admin: GET /admin/bookings/:id
 */
const getBookingById = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) }
    });

    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    return successResponse(res, 'Booking details retrieved', booking);
  } catch (err) {
    logger.error(`Error fetching booking ID ${id}:`, err);
    return errorResponse(res, 'Failed to retrieve booking details', 500);
  }
};

/**
 * Admin: PUT /admin/bookings/:id/status
 */
const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Rejected'];
  if (!validStatuses.includes(status)) {
    return errorResponse(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) }
    });

    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    const updated = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    logger.info(`Booking ${booking.bookingNumber} status updated to ${status}`);
    return successResponse(res, 'Booking status updated successfully', updated);
  } catch (err) {
    logger.error(`Error updating booking status ID ${id}:`, err);
    return errorResponse(res, 'Failed to update booking status', 500);
  }
};

/**
 * Admin: PUT /admin/bookings/:id/reschedule
 */
const rescheduleBooking = async (req, res) => {
  const { id } = req.params;
  const { dateStr, timeSlot } = req.body;

  if (!dateStr || !timeSlot || !isValidDate(dateStr)) {
    return errorResponse(res, 'Valid dateStr (YYYY-MM-DD) and timeSlot are required.', 400);
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) }
    });

    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    // Check availability on the target date
    const targetDate = new Date(dateStr);
    const available = await getAvailableSlots(dateStr);
    
    // Ignore current slot if rescheduling to the same day and time
    const isSameSlot = booking.dateStr.toDateString() === targetDate.toDateString() && booking.timeSlot === timeSlot;
    if (!available.includes(timeSlot) && !isSameSlot) {
      return errorResponse(res, 'The selected slot is no longer available.', 400);
    }

    const updated = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: {
        dateStr: targetDate,
        timeSlot
      }
    });

    logger.info(`Booking ${booking.bookingNumber} rescheduled to ${dateStr} at ${timeSlot}`);
    return successResponse(res, 'Booking rescheduled successfully', updated);
  } catch (err) {
    logger.error(`Error rescheduling booking ID ${id}:`, err);
    return errorResponse(res, 'Failed to reschedule booking', 500);
  }
};

/**
 * Admin: POST /admin/bookings (walk-in creation)
 */
const createAdminBooking = async (req, res) => {
  req.body.createdSource = 'admin';
  return createPublicBooking(req, res);
};

/**
 * Admin: DELETE /admin/bookings/:id
 */
const deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) }
    });

    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    await prisma.booking.delete({
      where: { id: parseInt(id) }
    });

    logger.info(`Booking ${booking.bookingNumber} deleted by admin`);
    return successResponse(res, 'Booking deleted successfully');
  } catch (err) {
    logger.error(`Error deleting booking ID ${id}:`, err);
    return errorResponse(res, 'Failed to delete booking', 500);
  }
};

module.exports = {
  createBookingSchema,
  getPublicSlots,
  createPublicBooking,
  getAdminBookings,
  getAdminBookingsCalendar,
  getBookingById,
  updateBookingStatus,
  rescheduleBooking,
  createAdminBooking,
  deleteBooking
};
