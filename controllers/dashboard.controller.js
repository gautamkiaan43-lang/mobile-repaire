const { prisma } = require('../config/db');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/v1/admin/dashboard/stats
 * Returns aggregated counts for dashboard cards.
 */
const getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalBookings,
      newBookings,
      completedBookings,
      todayBookings
    ] = await prisma.$transaction([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'Pending' } }),
      prisma.booking.count({ where: { status: 'Completed' } }),
      prisma.booking.count({
        where: {
          dateStr: { gte: todayStart, lte: todayEnd }
        }
      })
    ]);

    return successResponse(res, 'Dashboard stats retrieved', {
      totalBookings,
      newBookings,
      completedBookings,
      todayBookings
    });
  } catch (err) {
    logger.error('Error fetching dashboard stats:', err);
    return errorResponse(res, 'Failed to retrieve dashboard stats', 500);
  }
};

/**
 * GET /api/v1/admin/dashboard/calendar?startDate=&endDate=
 * Returns booking records for calendar views (month/week/day/list).
 */
const getDashboardCalendar = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return errorResponse(res, 'Both startDate and endDate are required.', 400);
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
      orderBy: { dateStr: 'asc' },
      select: {
        id: true,
        bookingNumber: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        deviceBrand: true,
        deviceModel: true,
        repairName: true,
        dateStr: true,
        timeSlot: true,
        status: true,
        finalPrice: true,
        createdSource: true,
        notes: true,
        repairSnapshot: true
      }
    });

    return successResponse(res, 'Calendar bookings retrieved', bookings);
  } catch (err) {
    logger.error('Error fetching dashboard calendar:', err);
    return errorResponse(res, 'Failed to retrieve calendar bookings', 500);
  }
};

module.exports = {
  getDashboardStats,
  getDashboardCalendar
};
