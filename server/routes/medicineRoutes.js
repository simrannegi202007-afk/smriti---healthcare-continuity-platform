const express = require('express');
const router = express.Router();
const medicinesController = require('../controllers/medicinesController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, medicinesController.getMedicines);
router.post('/', authenticate, medicinesController.addMedicine);
router.patch('/:id/toggle', authenticate, medicinesController.toggleMedicineStatus);

router.get('/reminders', authenticate, medicinesController.getReminders);
router.post('/reminders', authenticate, medicinesController.addReminder);
router.patch('/reminders/:id/toggle', authenticate, medicinesController.toggleReminder);
router.delete('/reminders/:id', authenticate, medicinesController.deleteReminder);

module.exports = router;
