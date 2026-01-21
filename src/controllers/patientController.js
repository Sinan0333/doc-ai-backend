const User = require('../models/User');

// Patient protected routes - placeholder data for MVP
exports.getPatientDashboard = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const Report = require('../models/Report');

    // 1. Get Total Reports
    const totalReports = await Report.countDocuments({ patientId });

    // 2. Get Risk Alerts (Abnormal reports)
    const riskAlerts = await Report.countDocuments({ 
        patientId, 
        isAbnormal: true 
    });

    // 3. Get Last Report Date
    const lastReport = await Report.findOne({ patientId })
        .sort({ reportDate: -1 })
        .select('reportDate');

    // 4. Get Recent Reports (last 5)
    const recentReportsRaw = await Report.find({ patientId })
        .sort({ reportDate: -1 })
        .limit(5)
        .populate('doctorReview.doctorId', 'fullName');

    const recentReports = recentReportsRaw.map(report => ({
        id: report._id,
        name: report.reportName,
        date: report.reportDate.toISOString().split('T')[0],
        status: report.isAbnormal ? 'Abnormal' : 'Normal',
        doctor: report.doctorReview?.doctorId?.fullName || 'Not assigned'
    }));

    // 5. Monthly Stats for Health Trends (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const healthTrends = await Report.aggregate([
      {
        $match: {
          patientId: patientId,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const dashboard = {
      totalReports,
      lastReportDate: lastReport ? lastReport.reportDate : null,
      riskAlerts,
      recentReports,
      healthTrends,
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
