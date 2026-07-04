const mongoose = require('mongoose');

const appSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'default',
      unique: true,
      immutable: true,
    },
    botDisplayName: {
      type: String,
      trim: true,
      default: '',
    },
    botUsername: {
      type: String,
      trim: true,
      default: '',
    },
    cbeAccountNumber: {
      type: String,
      trim: true,
      default: '',
    },
    telebirrPhone: {
      type: String,
      trim: true,
      default: '',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AppSettings', appSettingsSchema);
