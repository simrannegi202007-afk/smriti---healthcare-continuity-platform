const express = require('express');
const router = express.Router();
const recordsController = require('../controllers/recordsController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/', authenticate, recordsController.getRecords);
router.get('/trends', authenticate, recordsController.getTrends);
router.get('/:id', authenticate, recordsController.getRecordById);

// Protected file streaming endpoint (PRD Section 9: Files are not publicly accessible)
router.get('/:id/file', optionalAuth, recordsController.getRecordFile);

router.post('/check-duplicate', authenticate, recordsController.checkDuplicate);
router.post('/upload', authenticate, upload.single('file'), recordsController.uploadRecord);
router.delete('/:id', authenticate, recordsController.deleteRecord);

module.exports = router;
