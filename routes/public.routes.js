const express = require('express');
const router = express.Router();

const catalogController = require('../controllers/catalog.controller');
const bookingController = require('../controllers/booking.controller');
const settingsController = require('../controllers/settings.controller');
const { validateBody } = require('../middleware/validate');

// Catalog
router.get('/catalog', catalogController.getCatalog);

// Time Slots
router.get('/slots', bookingController.getPublicSlots);

// Bookings
router.post('/bookings', validateBody(bookingController.createBookingSchema), bookingController.createPublicBooking);

// Store Settings
router.get('/settings', settingsController.getPublicSettings);

module.exports = router;
