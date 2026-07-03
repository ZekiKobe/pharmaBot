const Post = require('../models/Post');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { getBot } = require('../bot/botInstance');
const { publishPostToChannels, unpublishPostFromChannels } = require('./channelService');
const { notifyAdminsPendingPost } = require('./adminNotifyService');
const { escapeHtml } = require('./telegramService');
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
    medicineImage: data.medicineImage,
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

  notifyAdminsPendingPost(post._id).catch((err) => {
    logger.warn(`Admin notification failed: ${err.message}`);
  });

  return { post, payment };
};

const approvePost = async (postId, adminId) => {
  const post = await Post.findById(postId).populate('userId');
  if (!post) throw new Error('Post not found');
  if (post.approvalStatus === 'approved') throw new Error('Post already approved');
  if (post.approvalStatus === 'rejected') throw new Error('Post was already rejected');
  if (post.approvalStatus !== 'pending') throw new Error('Post is not awaiting review');

  const bot = getBot();
  const publishedChannels = await publishPostToChannels(post, bot);

  post.approvalStatus = 'approved';
  post.paymentStatus = 'verified';
  post.isActive = true;
  post.publishedChannels = publishedChannels;
  post.telegramChannelMessageId = publishedChannels[0]?.messageId || null;
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
        `✅ Your ${post.type === 'buyer' ? 'buyer request' : 'seller listing'} for <b>${escapeHtml(post.medicineName)}</b> has been approved and published!`,
        { parse_mode: 'HTML' }
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
  if (post.approvalStatus === 'rejected') throw new Error('Post already rejected');
  if (post.approvalStatus !== 'pending') throw new Error('Post is not awaiting review');

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
        `❌ Your post for <b>${escapeHtml(post.medicineName)}</b> was rejected.\n\n<b>Reason:</b> ${escapeHtml(reason)}`,
        { parse_mode: 'HTML' }
      );
    } catch (err) {
      logger.warn(`Failed to notify user: ${err.message}`);
    }
  }

  return post;
};

const getOwnedPost = async (postId, telegramId) => {
  const user = await User.findOne({ telegramId: String(telegramId) });
  if (!user) throw new Error('User not found');

  const post = await Post.findOne({ _id: postId, userId: user._id });
  if (!post) throw new Error('Post not found');

  return { user, post };
};

const assertPostEditable = (post) => {
  if (post.approvalStatus === 'approved') {
    throw new Error('Approved posts cannot be changed');
  }
};

const updateMyPost = async (postId, telegramId, data) => {
  const { user, post } = await getOwnedPost(postId, telegramId);
  assertPostEditable(post);

  const fields = {
    medicineName: data.medicineName,
    strength: data.strength,
    quantity: data.quantity,
    city: data.city,
    description: data.description,
    contactPhone: data.contactPhone,
    telegramUsername: data.telegramUsername,
    category: data.category,
  };

  if (post.type === 'seller') {
    if (!data.brand?.trim()) throw new Error('Brand is required');
    if (!data.strength?.trim()) throw new Error('Strength is required');
    if (!data.category?.trim()) throw new Error('Category is required');
    if (data.price == null || data.price === '' || Number(data.price) <= 0) {
      throw new Error('Price must be greater than 0');
    }
    fields.brand = data.brand;
    fields.price = Number(data.price);
    if (data.expiryDate) fields.expiryDate = new Date(data.expiryDate);
  }

  if (!data.medicineName?.trim()) throw new Error('Medicine name is required');
  if (!data.quantity?.trim()) throw new Error('Quantity is required');
  if (!data.city?.trim()) throw new Error('City is required');
  if (!data.contactPhone?.trim()) throw new Error('Contact phone is required');

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) post[key] = value;
  });

  if (data.medicineImage !== undefined) {
    post.medicineImage = data.medicineImage || undefined;
  }

  if (data.fullName || data.telegramUsername || data.contactPhone) {
    user.fullName = data.fullName || user.fullName;
    user.username = data.telegramUsername || user.username;
    user.phoneNumber = data.contactPhone || user.phoneNumber;
    await user.save();
  }

  await post.save();
  return post;
};

const deleteMyPost = async (postId, telegramId) => {
  const { post } = await getOwnedPost(postId, telegramId);
  assertPostEditable(post);

  await Payment.deleteMany({ postId: post._id });
  await Post.findByIdAndDelete(post._id);
  return post;
};

const adminDeletePost = async (postId) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error('Post not found');

  const bot = getBot();
  if (post.approvalStatus === 'approved' && post.publishedChannels?.length) {
    await unpublishPostFromChannels(post, bot);
  }

  await Payment.deleteMany({ postId: post._id });
  await Post.findByIdAndDelete(post._id);
  return post;
};

const setPostActive = async (postId, isActive) => {
  const post = await Post.findById(postId).populate('userId');
  if (!post) throw new Error('Post not found');
  if (post.approvalStatus !== 'approved') {
    throw new Error('Only approved posts can be activated or deactivated');
  }

  const bot = getBot();
  const becomingInactive = post.isActive !== false && isActive === false;
  const becomingActive = post.isActive === false && isActive === true;

  if (becomingInactive && post.publishedChannels?.length) {
    await unpublishPostFromChannels(post, bot);
  }

  if (becomingActive && bot) {
    const publishedChannels = await publishPostToChannels(post, bot);
    post.publishedChannels = publishedChannels;
    post.telegramChannelMessageId = publishedChannels[0]?.messageId || null;
  }

  post.isActive = isActive;
  await post.save();
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
  getOwnedPost,
  updateMyPost,
  deleteMyPost,
  adminDeletePost,
  setPostActive,
  getPaymentInfo,
  POST_PRICE,
};
