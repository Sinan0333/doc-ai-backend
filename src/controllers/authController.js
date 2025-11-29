const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Helper to format user response
const formatUser = (user) => ({
  id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  role: user.role
});

// Register Patient
exports.registerPatient = async (req, res, next) => {
  try {
    const { fullName, email, password, age, gender, phone, address } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already in use' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      password: hashed,
      role: 'patient',
      age, gender, phone, address
    });

    const token = generateToken({ id: user._id, role: user.role });
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: formatUser(user),
      token
    });
  } catch (err) {
    next(err);
  }
};

// Patient login
exports.loginPatient = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.role !== 'patient') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const token = generateToken({ id: user._id, role: user.role });
    res.json({ 
      success: true,
      message: 'Login successful',
      user: formatUser(user), 
      token 
    });
  } catch (err) {
    next(err);
  }
};

// Doctor login (doctors are expected to be seeded or created by admin)
exports.loginDoctor = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || (user.role !== 'doctor' && user.role !== 'admin')) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const token = generateToken({ id: user._id, role: user.role });
    res.json({ 
      success: true,
      message: 'Login successful',
      user: formatUser(user), 
      token 
    });
  } catch (err) {
    next(err);
  }
};

// Get current user (for session restore)
exports.getCurrentUser = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware
    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: formatUser(req.user)
    });
  } catch (err) {
    next(err);
  }
};
