const express = require('express');
const { getDoctorDashboard, getPatients } = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// All doctor routes require authentication and 'doctor' role
router.get('/dashboard', authMiddleware, roleMiddleware('doctor'), getDoctorDashboard);
router.get('/patients', authMiddleware, roleMiddleware('doctor'), getPatients);

module.exports = router;
