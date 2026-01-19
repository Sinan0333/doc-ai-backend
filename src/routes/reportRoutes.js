const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadReport } = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/report/upload
// Protected route - requires login? Let's assume yes, or leave open for dev.
// Adding authMiddleware for security.
router.post('/upload', authMiddleware, upload.single('report'), uploadReport);

module.exports = router;
