const { getAppSettings, updateAppSettings, normalizeSettings } = require('../services/settingsService');

const phonePattern = /^[+\d\s()-]{9,20}$/;

const getSettings = async (_req, res, next) => {
  try {
    const settings = await getAppSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const settings = normalizeSettings(req.body);
    const fieldErrors = {};

    if (!settings.botDisplayName) {
      fieldErrors.botDisplayName = 'Bot display name is required';
    }
    if (!settings.cbeAccountNumber) {
      fieldErrors.cbeAccountNumber = 'CBE account number is required';
    }
    if (!settings.telebirrPhone) {
      fieldErrors.telebirrPhone = 'Telebirr phone is required';
    } else if (!phonePattern.test(settings.telebirrPhone)) {
      fieldErrors.telebirrPhone = 'Enter a valid Telebirr phone number';
    }

    if (Object.keys(fieldErrors).length) {
      return res.status(400).json({
        success: false,
        message: 'Please correct the highlighted settings fields.',
        fieldErrors,
      });
    }

    const updated = await updateAppSettings(settings, req.admin?._id);
    res.json({
      success: true,
      data: {
        botDisplayName: updated.botDisplayName,
        botUsername: updated.botUsername,
        cbeAccountNumber: updated.cbeAccountNumber,
        telebirrPhone: updated.telebirrPhone,
      },
      message: 'Settings updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
