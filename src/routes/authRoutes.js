const express = require('express');
const { registerPatient, loginPatient, loginDoctor, getCurrentUser } = require('../controllers/authController');
const { registerPatientValidator, loginValidator } = require('../validators/authValidators');
const { handleValidationErrors } = require('../middleware/errorMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerPatientValidator, handleValidationErrors, registerPatient);

// POST /api/auth/patient-login
router.post('/patient-login', loginValidator, handleValidationErrors, loginPatient);

// POST /api/auth/doctor-login
router.post('/doctor-login', loginValidator, handleValidationErrors, loginDoctor);

// GET /api/auth/me - Get current user
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
