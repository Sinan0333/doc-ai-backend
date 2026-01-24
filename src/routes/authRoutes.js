const express = require('express');
const { registerPatient, loginPatient, loginDoctor, loginAdmin, getCurrentUser, updateProfile, changePassword } = require('../controllers/authController');
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

// POST /api/auth/admin-login
router.post('/admin-login', loginValidator, handleValidationErrors, loginAdmin);

// GET /api/auth/me - Get current user
// GET /api/auth/me - Get current user
router.get('/me', authMiddleware, getCurrentUser);

// PUT /api/auth/profile - Update profile
router.put('/profile', authMiddleware, updateProfile);

// PUT /api/auth/change-password - Change password
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
