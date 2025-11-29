// Usage: roleMiddleware('doctor') or roleMiddleware('patient')
const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }
    if (user.role !== requiredRole && user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Forbidden: insufficient privileges' 
      });
    }
    next();
  };
};

module.exports = roleMiddleware;
