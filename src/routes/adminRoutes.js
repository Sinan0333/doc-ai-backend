const express = require('express');
const { getAdminDashboard, getDoctors, addDoctor, getDoctorActivity, getPatients } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// All admin routes require authentication and 'admin' role
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/doctors', getDoctors);
router.post('/doctors', addDoctor);
router.get('/doctors/:doctorId/activity', getDoctorActivity);
router.get('/patients', getPatients);

module.exports = router;
