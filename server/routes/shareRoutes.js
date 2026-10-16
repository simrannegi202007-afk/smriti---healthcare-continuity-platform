const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');
const { authenticate } = require('../middleware/authMiddleware');

// Patient endpoints (Protected)
router.post('/create', authenticate, shareController.createShareLink);
router.post('/revoke', authenticate, shareController.revokeShareLink);
router.get('/active', authenticate, shareController.listActiveShares);

// Doctor viewing endpoints (Public with token verification & expiry enforcement)
router.get('/doctor-summary/:token', shareController.getDoctorSummary);
router.post('/doctor-summary/:token/note', shareController.addDoctorNote);

module.exports = router;
