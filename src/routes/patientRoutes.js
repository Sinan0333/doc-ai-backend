const express = require('express');
const { getPatientDashboard } = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// All patient routes require authentication and 'patient' role
router.get('/dashboard', authMiddleware, roleMiddleware('patient'), getPatientDashboard);

module.exports = router;
