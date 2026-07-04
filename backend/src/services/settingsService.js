const AppSettings = require('../models/AppSettings');

const DEFAULT_KEY = 'default';

function getEnvBackedDefaults() {
  return {
    botDisplayName: process.env.TELEGRAM_BOT_DISPLAY_NAME || 'PharmaBot',
    botUsername: String(process.env.TELEGRAM_BOT_USERNAME || '').replace(/^@/, ''),
    cbeAccountNumber: process.env.CBE_ACCOUNT_NUMBER || '',
    telebirrPhone: process.env.TELEBIRR_PHONE || '',
  };
}

function normalizeSettings(input = {}) {
  return {
    botDisplayName: String(input.botDisplayName || '').trim(),
    botUsername: String(input.botUsername || '').trim().replace(/^@/, ''),
    cbeAccountNumber: String(input.cbeAccountNumber || '').trim(),
    telebirrPhone: String(input.telebirrPhone || '').trim(),
  };
}

async function getSettingsDocument() {
  return AppSettings.findOne({ key: DEFAULT_KEY });
}

async function getAppSettings() {
  const defaults = getEnvBackedDefaults();
  const settings = await AppSettings.findOne({ key: DEFAULT_KEY }).lean();

  if (!settings) {
    return defaults;
  }

  return {
    botDisplayName: settings.botDisplayName || defaults.botDisplayName,
    botUsername: settings.botUsername || defaults.botUsername,
    cbeAccountNumber: settings.cbeAccountNumber || defaults.cbeAccountNumber,
    telebirrPhone: settings.telebirrPhone || defaults.telebirrPhone,
  };
}

async function updateAppSettings(input, adminId) {
  const normalized = normalizeSettings(input);
  return AppSettings.findOneAndUpdate(
    { key: DEFAULT_KEY },
    {
      ...normalized,
      updatedBy: adminId || null,
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
}

module.exports = {
  DEFAULT_KEY,
  getEnvBackedDefaults,
  normalizeSettings,
  getSettingsDocument,
  getAppSettings,
  updateAppSettings,
};
