const User = require('../models/User');
const Report = require('../models/Report');

// Doctor protected routes - placeholder data for MVP
exports.getPatients = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        const query = { role: 'patient' };

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const patients = await User.find(query)
            .select('-password') // Exclude password
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: patients,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        next(err);
    }
};
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

exports.getPatientHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { reportType, startDate, endDate, search } = req.query;

    // First, verify the patient exists
    const patient = await User.findOne({ _id: patientId, role: 'patient' })
      .select('fullName email phone gender age address createdAt');
    
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Build query for reports
    const query = { patientId };

    if (reportType && reportType !== 'all') {
      query.reportType = reportType;
    }

    if (startDate || endDate) {
      query.reportDate = {};
      if (startDate) query.reportDate.$gte = new Date(startDate);
      if (endDate) query.reportDate.$lte = new Date(endDate);
    }

    if (search) {
      query.reportName = { $regex: search, $options: 'i' };
    }

    // Fetch reports
    const reports = await Report.find(query)
      .sort({ reportDate: -1 })
      .skip(skip)
      .limit(limit)
      .select('-extractedText') // Exclude heavy text field
      .populate('doctorReview.doctorId', 'fullName email');

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: {
        patient,
        reports
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getReviewRequests = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { reportType, startDate, endDate } = req.query;

    // Build query for review requests
    const query = {
      'doctorReview.status': 'requested',
      'doctorReview.doctorId': doctorId
    };

    if (reportType && reportType !== 'all') {
      query.reportType = reportType;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Fetch review requests
    const requests = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-extractedText') // Exclude heavy text field
      .populate('patientId', 'fullName email phone age gender');

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.submitReview = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { notes } = req.body;
    const doctorId = req.user._id;

    // Find the report and verify it's assigned to this doctor
    const report = await Report.findOne({
      _id: reportId,
      'doctorReview.doctorId': doctorId,
      'doctorReview.status': 'requested'
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or already reviewed'
      });
    }

    // Update the review
    report.doctorReview.status = 'reviewed';
    report.doctorReview.reviewedDate = new Date();
    report.doctorReview.notes = notes;

    await report.save();

    res.json({
      success: true,
      message: 'Review submitted successfully',
      data: report
    });
  } catch (err) {
    next(err);
  }
};
