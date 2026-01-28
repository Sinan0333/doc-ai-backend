const User = require('../models/User');
const Report = require('../models/Report');
const bcrypt = require('bcryptjs');

// Get Admin Dashboard Stats
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalReports = await Report.countDocuments();
    
    // Get recent 5 doctors
    const recentDoctors = await User.find({ role: 'doctor' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password');

    // Monthly trends for reports (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const reportTrends = await Report.aggregate([
      {
        $match: {
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

    res.json({
      success: true,
      data: {
        stats: {
          totalDoctors,
          totalPatients,
          totalReports
        },
        recentDoctors,
        reportTrends
      }
    });
  } catch (err) {
    next(err);
  }
};

// List Doctors with Pagination and Filter
exports.getDoctors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = { role: 'doctor', isDeleted: { $ne: true } };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: doctors,
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

// Soft Delete Doctor
exports.deleteDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    const doctor = await User.findOneAndUpdate(
      { _id: doctorId, role: 'doctor' },
      { isDeleted: true },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor removed successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Add New Doctor
exports.addDoctor = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, gender } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create doctor
    const doctor = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: 'doctor',
      phone,
      gender
    });

    res.status(201).json({
      success: true,
      message: 'Doctor added successfully',
      data: {
        id: doctor._id,
        fullName: doctor.fullName,
        email: doctor.email,
        role: doctor.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get Doctor Activity (Reports handled by doctor)
exports.getDoctorActivity = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Verify doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' }).select('fullName email');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const query = { 'doctorReview.doctorId': doctorId };

    const reports = await Report.find(query)
      .populate('patientId', 'fullName email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: {
        doctor,
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

// List Patients with Pagination and Filter (Admin)
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
      .select('-password')
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

// Get Patient History for Admin
exports.getAdminPatientHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Verify patient exists
    const patient = await User.findOne({ _id: patientId, role: 'patient' })
      .select('fullName email phone gender age address');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const query = { patientId };

    const reports = await Report.find(query)
      .sort({ reportDate: -1 })
      .skip(skip)
      .limit(limit)
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
