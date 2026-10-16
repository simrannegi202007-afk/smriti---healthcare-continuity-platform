const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { authenticate } = require('../middleware/authMiddleware');

// Public view for first responders / emergency triage (No login needed!)
router.get('/view/:token', emergencyController.getEmergencyCard);

// Patient configuration endpoints
router.get('/my-card', authenticate, emergencyController.getMyEmergencyCard);
router.put('/my-card', authenticate, emergencyController.updateEmergencyCard);

module.exports = router;
