const express = require('express');
const { getDoctorDashboard, getPatients, getPatientHistory, getReviewRequests } = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// All doctor routes require authentication and 'doctor' role
router.get('/dashboard', authMiddleware, roleMiddleware('doctor'), getDoctorDashboard);
router.get('/patients', authMiddleware, roleMiddleware('doctor'), getPatients);
router.get('/patients/:patientId/history', authMiddleware, roleMiddleware('doctor'), getPatientHistory);
router.get('/review-requests', authMiddleware, roleMiddleware('doctor'), getReviewRequests);

module.exports = router;
