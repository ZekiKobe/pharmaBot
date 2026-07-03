const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['buyer', 'seller'],
      required: true,
      index: true,
    },
    medicineName: { type: String, required: true, trim: true, index: true },
    brand: { type: String, trim: true },
    strength: { type: String, trim: true },
    quantity: { type: String, required: true, trim: true },
    price: { type: Number },
    expiryDate: { type: Date },
    city: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    telegramUsername: { type: String, trim: true },
    category: { type: String, trim: true },
    medicineImage: { type: String },
    paymentScreenshot: { type: String },
    paymentStatus: {
      type: String,
      enum: ['pending', 'submitted', 'verified', 'rejected'],
      default: 'pending',
    },
    approvalStatus: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected'],
      default: 'draft',
      index: true,
    },
    rejectionReason: { type: String },
    telegramChannelMessageId: { type: String },
    publishedChannels: [
      {
        channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
        channelName: { type: String },
        telegramChannelId: { type: String },
        messageId: { type: String },
      },
    ],
    approvedAt: { type: Date },
    amount: { type: Number, default: 20 },
  },
  { timestamps: true }
);

postSchema.index({ medicineName: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Post', postSchema);
