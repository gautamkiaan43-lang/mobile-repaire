const { prisma } = require('../config/db');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/v1/admin/search?q=
 * Global search across bookings (bookingNumber, customerName, customerPhone, deviceModel).
 * Returns max 10 results.
 */
const globalSearch = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    return successResponse(res, 'Search results', { bookings: [], totalResults: 0 });
  }

  const searchTerm = q.trim();

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { bookingNumber: { contains: searchTerm } },
          { customerName: { contains: searchTerm } },
          { customerPhone: { contains: searchTerm } },
          { customerEmail: { contains: searchTerm } },
          { deviceModel: { contains: searchTerm } }
        ]
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        bookingNumber: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        deviceModel: true,
        repairName: true,
        status: true,
        dateStr: true,
        timeSlot: true,
        finalPrice: true
      }
    });

    return successResponse(res, 'Search results', {
      bookings,
      totalResults: bookings.length
    });
  } catch (err) {
    logger.error('Error performing global search:', err);
    return errorResponse(res, 'Search failed', 500);
  }
};

module.exports = {
  globalSearch
};
