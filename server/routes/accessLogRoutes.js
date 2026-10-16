const express = require('express');
const router = express.Router();
const accessLogController = require('../controllers/accessLogController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, accessLogController.getAccessLogs);

module.exports = router;
