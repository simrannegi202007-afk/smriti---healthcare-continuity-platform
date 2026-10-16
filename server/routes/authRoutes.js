const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', authenticate, authController.getMe);
router.put('/settings', authenticate, authController.updateSettings);
router.put('/profile', authenticate, authController.updateProfile);
router.delete('/delete-all-data', authenticate, authController.deleteMyData);

module.exports = router;
