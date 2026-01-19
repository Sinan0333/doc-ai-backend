const express = require('express');
const { getPatientDashboard, getDoctorsList } = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// All patient routes require authentication and 'patient' role
router.get('/dashboard', authMiddleware, roleMiddleware('patient'), getPatientDashboard);
router.get('/doctors', authMiddleware, roleMiddleware('patient'), getDoctorsList);

module.exports = router;
