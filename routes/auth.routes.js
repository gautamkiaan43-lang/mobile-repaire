const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateBody } = require('../middleware/validate');

router.post('/login', validateBody(authController.loginSchema), authController.login);
router.post('/logout', authController.logout);

module.exports = router;
