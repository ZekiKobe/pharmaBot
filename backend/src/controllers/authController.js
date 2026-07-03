const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const admin = await AdminUser.findOne({ username: username.toLowerCase() });

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        admin: { id: admin._id, username: admin.username, role: admin.role },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res) => {
  res.json({
    success: true,
    data: { id: req.admin._id, username: req.admin.username, role: req.admin.role },
  });
};

module.exports = { login, getProfile };
