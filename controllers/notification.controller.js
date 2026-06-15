const { prisma } = require('../config/db');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');

const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: {
            bookingNumber: true,
            customerName: true
          }
        }
      }
    });

    return successResponse(res, 'Notifications retrieved', notifications);
  } catch (err) {
    logger.error('Error fetching notifications:', err);
    return errorResponse(res, 'Failed to retrieve notifications', 500);
  }
};

const markNotificationRead = async (req, res) => {
  const { id } = req.params;
  try {
    const notif = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notif) {
      return errorResponse(res, 'Notification not found', 404);
    }

    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true }
    });

    return successResponse(res, 'Notification marked as read successfully', updated);
  } catch (err) {
    logger.error(`Error marking notification ID ${id} read:`, err);
    return errorResponse(res, 'Failed to update notification status', 500);
  }
};

const clearAdminNotifications = async (req, res) => {
  try {
    // Delete all read notifications or simply delete all to clear
    const { count } = await prisma.notification.deleteMany({
      where: { isRead: true }
    });

    logger.info(`Cleared ${count} read notifications from database`);
    return successResponse(res, `Cleared ${count} read notifications`);
  } catch (err) {
    logger.error('Error clearing notifications:', err);
    return errorResponse(res, 'Failed to clear notifications', 500);
  }
};

module.exports = {
  getAdminNotifications,
  markNotificationRead,
  clearAdminNotifications
};
