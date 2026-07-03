const { Markup } = require('telegraf');
const Post = require('../models/Post');
const { getBot } = require('../bot/botInstance');
const logger = require('../utils/logger');

const getAdminTelegramIds = () =>
  (process.env.ADMIN_TELEGRAM_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

const getPublicBaseUrl = () =>
  process.env.API_BASE_URL || process.env.MINI_APP_URL || `http://localhost:${process.env.PORT || 5000}`;

const buildPendingReviewMessage = (post) => {
  const typeLabel = post.type === 'buyer' ? '🔍 Buyer Request' : '💊 Seller Listing';
  const user = post.userId;

  return (
    `🆕 *New post awaiting review*\n\n` +
    `${typeLabel}\n\n` +
    `*Medicine:* ${post.medicineName}\n` +
    (post.strength ? `*Strength:* ${post.strength}\n` : '') +
    `*City:* ${post.city}\n` +
    `*Quantity:* ${post.quantity}\n` +
    (post.price ? `*Price:* ETB ${post.price}\n` : '') +
    (user?.fullName ? `*User:* ${user.fullName}\n` : '') +
    (user?.username ? `*Telegram:* @${user.username}\n` : '') +
    `*Submitted:* ${new Date(post.createdAt).toLocaleString()}\n\n` +
    `Approve or reject here, or use the admin panel.`
  );
};

const notifyAdminsPendingPost = async (postId) => {
  const bot = getBot();
  const adminIds = getAdminTelegramIds();

  if (!bot || !adminIds.length) {
    if (!adminIds.length) {
      logger.warn('ADMIN_TELEGRAM_IDS not set; bot admins will not be notified');
    }
    return;
  }

  const post = await Post.findById(postId).populate('userId', 'username fullName telegramId');
  if (!post || post.approvalStatus !== 'pending') return;

  const text = buildPendingReviewMessage(post);
  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Approve', `approve_${post._id}`),
      Markup.button.callback('❌ Reject', `reject_${post._id}`),
    ],
  ]);

  const baseUrl = getPublicBaseUrl();

  for (const adminId of adminIds) {
    try {
      if (post.paymentScreenshot) {
        await bot.telegram.sendPhoto(adminId, `${baseUrl}${post.paymentScreenshot}`, {
          caption: text,
          parse_mode: 'Markdown',
          ...keyboard,
        });
      } else {
        await bot.telegram.sendMessage(adminId, text, { parse_mode: 'Markdown', ...keyboard });
      }
    } catch (err) {
      logger.warn(`Failed to notify admin ${adminId}: ${err.message}`);
    }
  }
};

module.exports = {
  getAdminTelegramIds,
  notifyAdminsPendingPost,
  buildPendingReviewMessage,
};
