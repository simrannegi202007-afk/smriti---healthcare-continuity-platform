const express = require('express');
const router = express.Router();
const recordsController = require('../controllers/recordsController');
const { authenticate } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/', authenticate, recordsController.getRecords);
router.get('/trends', authenticate, recordsController.getTrends);
router.get('/:id', authenticate, recordsController.getRecordById);
router.post('/check-duplicate', authenticate, recordsController.checkDuplicate);
router.post('/upload', authenticate, upload.single('file'), recordsController.uploadRecord);

module.exports = router;
