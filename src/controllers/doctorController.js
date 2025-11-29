// Doctor protected routes - placeholder data for MVP
exports.getDoctorDashboard = async (req, res, next) => {
  try {
    const dashboard = {
      totalPatients: 243,
      pendingReports: 7,
      abnormalCases: 14,
      recentPatients: [
        { id: 'p1', name: 'Arjun Kumar', lastReport: '2025-10-28' },
        { id: 'p2', name: 'Meera Nair', lastReport: '2025-10-27' }
      ]
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
