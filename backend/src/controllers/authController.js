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

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const fieldErrors = {};

    if (!currentPassword) {
      fieldErrors.currentPassword = 'Current password is required';
    }
    if (!newPassword) {
      fieldErrors.newPassword = 'New password is required';
    } else if (String(newPassword).length < 6) {
      fieldErrors.newPassword = 'New password must be at least 6 characters';
    }
    if (!confirmPassword) {
      fieldErrors.confirmPassword = 'Please confirm the new password';
    } else if (newPassword && newPassword !== confirmPassword) {
      fieldErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(fieldErrors).length) {
      return res.status(400).json({
        success: false,
        message: 'Please correct the password form.',
        fieldErrors,
      });
    }

    const admin = await AdminUser.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (!(await admin.comparePassword(currentPassword))) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
        fieldErrors: { currentPassword: 'Current password is incorrect' },
      });
    }

    if (await admin.comparePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from your current password',
        fieldErrors: { newPassword: 'New password must be different from your current password' },
      });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: 'Password changed successfully' });
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

module.exports = { login, getProfile, changePassword };
