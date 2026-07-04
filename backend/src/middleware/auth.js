const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

const authAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await AdminUser.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const requireSuperadmin = (req, res, next) => {
  if (req.admin?.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Only superadmins can update global settings.',
    });
  }
  next();
};

module.exports = { authAdmin, requireSuperadmin };
