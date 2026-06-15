const express = require('express');
const router = express.Router();

const { verifyAdminToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

const bookingController = require('../controllers/booking.controller');
const storeHoursController = require('../controllers/storeHours.controller');
const exceptionController = require('../controllers/exception.controller');
const settingsController = require('../controllers/settings.controller');
const notificationController = require('../controllers/notification.controller');
const catalogController = require('../controllers/catalog.controller');
const dashboardController = require('../controllers/dashboard.controller');
const searchController = require('../controllers/search.controller');
const authController = require('../controllers/auth.controller');

// Apply verifyAdminToken middleware globally to all admin routes
router.use(verifyAdminToken);

// --- Auth Extra ---
router.put('/change-password', authController.changePassword);

// --- Dashboard ---
router.get('/dashboard/stats', dashboardController.getDashboardStats);
router.get('/dashboard/calendar', dashboardController.getDashboardCalendar);

// --- Global Search ---
router.get('/search', searchController.globalSearch);

// --- Bookings ---
router.get('/bookings', bookingController.getAdminBookings);
router.get('/bookings/calendar', bookingController.getAdminBookingsCalendar);
router.get('/bookings/:id', bookingController.getBookingById);
router.post('/bookings', validateBody(bookingController.createBookingSchema), bookingController.createAdminBooking);
router.put('/bookings/:id/status', bookingController.updateBookingStatus);
router.put('/bookings/:id/reschedule', bookingController.rescheduleBooking);
router.delete('/bookings/:id', bookingController.deleteBooking);

// --- Store Hours ---
router.get('/store-hours', storeHoursController.getStoreHours);
router.put('/store-hours', validateBody(storeHoursController.storeHoursUpdateSchema), storeHoursController.updateStoreHours);

// --- Exceptions ---
router.get('/exceptions', exceptionController.getAdminExceptions);
router.post('/exceptions', validateBody(exceptionController.exceptionSchema), exceptionController.createException);
router.put('/exceptions/:id', validateBody(exceptionController.exceptionSchema), exceptionController.updateException);
router.delete('/exceptions/:id', exceptionController.deleteException);

// --- Settings ---
router.get('/settings', settingsController.getAdminSettings);
router.put('/settings', validateBody(settingsController.settingsSchema), settingsController.updateAdminSettings);

// --- Notifications ---
router.get('/notifications', notificationController.getAdminNotifications);
router.put('/notifications/:id/read', notificationController.markNotificationRead);
router.delete('/notifications/clear', notificationController.clearAdminNotifications);

// --- Catalog Reload ---
router.post('/catalog/reload', catalogController.reloadCatalog);

module.exports = router;
