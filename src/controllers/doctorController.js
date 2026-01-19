const User = require('../models/User');

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
