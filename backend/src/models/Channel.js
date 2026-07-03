const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    telegramChannelId: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true, index: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Channel', channelSchema);
