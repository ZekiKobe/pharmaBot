const Post = require('../models/Post');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { getBot } = require('../bot/botInstance');
const { formatChannelMessage } = require('./telegramService');
const logger = require('../utils/logger');

const POST_PRICE = parseInt(process.env.POST_PRICE, 10) || 20;

const findOrCreateUser = async ({ telegramId, username, fullName, phoneNumber }) => {
  let user = await User.findOne({ telegramId: String(telegramId) });
  if (!user) {
    user = await User.create({
      telegramId: String(telegramId),
      username,
      fullName,
      phoneNumber,
    });
  } else {
    user.username = username || user.username;
    user.fullName = fullName || user.fullName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    await user.save();
  }
  return user;
};

const createPost = async (data, type) => {
  const user = await findOrCreateUser({
    telegramId: data.telegramId,
    username: data.telegramUsername,
    fullName: data.fullName,
    phoneNumber: data.contactPhone,
  });

  const postData = {
    userId: user._id,
    type,
    medicineName: data.medicineName,
    brand: data.brand,
    strength: data.strength,
    quantity: data.quantity,
    price: data.price,
    expiryDate: data.expiryDate,
    city: data.city,
    description: data.description,
    contactPhone: data.contactPhone,
    telegramUsername: data.telegramUsername,
    category: data.category,
    amount: POST_PRICE,
    approvalStatus: 'draft',
    paymentStatus: 'pending',
  };

  const post = await Post.create(postData);
  return post.populate('userId', 'telegramId username fullName');
};

const submitPaymentScreenshot = async (postId, screenshotPath, telegramId) => {
  const user = await User.findOne({ telegramId: String(telegramId) });
  if (!user) throw new Error('User not found');

  const post = await Post.findOne({ _id: postId, userId: user._id });
  if (!post) throw new Error('Post not found');
  if (post.approvalStatus !== 'draft' && post.approvalStatus !== 'pending') {
    throw new Error('Post cannot accept payment at this stage');
  }

  post.paymentScreenshot = screenshotPath;
  post.paymentStatus = 'submitted';
  post.approvalStatus = 'pending';
  await post.save();

  const payment = await Payment.create({
    userId: user._id,
    postId: post._id,
    amount: POST_PRICE,
    screenshot: screenshotPath,
    status: 'pending',
  });

  return { post, payment };
};

const approvePost = async (postId, adminId) => {
  const post = await Post.findById(postId).populate('userId');
  if (!post) throw new Error('Post not found');
  if (post.approvalStatus === 'approved') throw new Error('Post already approved');

  const bot = getBot();
  let channelMessageId = null;

  if (bot && process.env.TELEGRAM_CHANNEL_ID) {
    try {
      const message = formatChannelMessage(post);
      const sent = await bot.telegram.sendMessage(process.env.TELEGRAM_CHANNEL_ID, message, {
        parse_mode: 'Markdown',
      });
      channelMessageId = String(sent.message_id);
    } catch (err) {
      logger.error(`Failed to publish to channel: ${err.message}`);
      throw new Error('Failed to publish to Telegram channel');
    }
  }

  post.approvalStatus = 'approved';
  post.paymentStatus = 'verified';
  post.telegramChannelMessageId = channelMessageId;
  post.approvedAt = new Date();
  await post.save();

  await Payment.findOneAndUpdate(
    { postId: post._id },
    { status: 'approved', reviewedBy: adminId, reviewedAt: new Date() }
  );

  if (bot && post.userId?.telegramId) {
    try {
      await bot.telegram.sendMessage(
        post.userId.telegramId,
        `✅ Your ${post.type === 'buyer' ? 'buyer request' : 'seller listing'} for *${post.medicineName}* has been approved and published!`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      logger.warn(`Failed to notify user: ${err.message}`);
    }
  }

  return post;
};

const rejectPost = async (postId, reason, adminId) => {
  const post = await Post.findById(postId).populate('userId');
  if (!post) throw new Error('Post not found');
  if (post.approvalStatus === 'approved') throw new Error('Cannot reject approved post');

  post.approvalStatus = 'rejected';
  post.paymentStatus = 'rejected';
  post.rejectionReason = reason;
  await post.save();

  await Payment.findOneAndUpdate(
    { postId: post._id },
    { status: 'rejected', reviewedBy: adminId, reviewedAt: new Date(), rejectionReason: reason }
  );

  const bot = getBot();
  if (bot && post.userId?.telegramId) {
    try {
      await bot.telegram.sendMessage(
        post.userId.telegramId,
        `❌ Your post for *${post.medicineName}* was rejected.\n\n*Reason:* ${reason}`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      logger.warn(`Failed to notify user: ${err.message}`);
    }
  }

  return post;
};

const getPaymentInfo = () => ({
  cbeAccountNumber: process.env.CBE_ACCOUNT_NUMBER || '1000262694392',
  telebirrPhone: process.env.TELEBIRR_PHONE || '0993676861',
  amount: POST_PRICE,
  currency: 'ETB',
});

module.exports = {
  findOrCreateUser,
  createPost,
  submitPaymentScreenshot,
  approvePost,
  rejectPost,
  getPaymentInfo,
  POST_PRICE,
};
