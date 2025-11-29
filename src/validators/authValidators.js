const { body } = require('express-validator');

const registerPatientValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars'),
  body('age').optional().isNumeric().withMessage('Age must be a number'),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('phone').optional().isMobilePhone('any'),
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = {
  registerPatientValidator,
  loginValidator,
};
