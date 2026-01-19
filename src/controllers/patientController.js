const User = require('../models/User');

// Patient protected routes - placeholder data for MVP
exports.getPatientDashboard = async (req, res, next) => {
  try {
    // req.user available from authMiddleware
    const dashboard = {
      totalReports: 12,
      lastReportDate: '2025-11-01',
      riskAlerts: 2,
      quickActions: ['upload_report', 'view_history', 'compare_reports']
    };
    res.json({ 
      success: true,
      message: 'Dashboard data retrieved successfully',
      user: {
        id: req.user._id.toString(),
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role
      },
      dashboard 
    });
  } catch (err) {
    next(err);
  }
};

exports.getDoctorsList = async (req, res, next) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('fullName email specialist');
        res.json({ success: true, count: doctors.length, data: doctors });
    } catch (err) {
        next(err);
    }
};
