const Post = require('../models/Post');
const { attachMedicineImage } = require('../utils/postBody');
const {
  createPost,
  submitPaymentScreenshot,
  getPaymentInfo,
  getOwnedPost,
  updateMyPost,
  deleteMyPost,
} = require('../services/postService');

const createBuyerPost = async (req, res, next) => {
  try {
    const post = await createPost(attachMedicineImage(req.body, req.file), 'buyer');
    res.status(201).json({
      success: true,
      data: post,
      paymentInfo: getPaymentInfo(),
      message: 'Buyer request created. Please complete payment.',
    });
  } catch (error) {
    next(error);
  }
};

const createSellerPost = async (req, res, next) => {
  try {
    const body = attachMedicineImage(req.body, req.file);
    const post = await createPost(
      { ...body, expiryDate: new Date(body.expiryDate) },
      'seller'
    );
    res.status(201).json({
      success: true,
      data: post,
      paymentInfo: getPaymentInfo(),
      message: 'Seller listing created. Please complete payment.',
    });
  } catch (error) {
    next(error);
  }
};

const uploadPayment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Payment screenshot is required',
        fieldErrors: { screenshot: 'Payment screenshot is required' },
      });
    }

    const { postId, telegramId } = req.body;
    if (!postId || !telegramId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID and Telegram ID are required',
        fieldErrors: {
          ...(!postId && { postId: 'Post ID is required' }),
          ...(!telegramId && { telegramId: 'Telegram user ID is missing. Open this app from Telegram.' }),
        },
      });
    }

    const screenshotPath = `/uploads/${req.file.filename}`;
    const result = await submitPaymentScreenshot(postId, screenshotPath, telegramId);

    res.json({
      success: true,
      data: result.post,
      message: 'Payment screenshot uploaded. Waiting for admin approval.',
    });
  } catch (error) {
    next(error);
  }
};

const getApprovedPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = { approvalStatus: 'approved', isActive: { $ne: false } };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.city) filter.city = new RegExp(req.query.city, 'i');
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ approvedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username fullName'),
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      approvalStatus: 'approved',
      isActive: { $ne: false },
    }).populate('userId', 'username fullName');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const getMyPosts = async (req, res, next) => {
  try {
    const { telegramId } = req.params;
    const User = require('../models/User');
    const user = await User.findOne({ telegramId: String(telegramId) });

    if (!user) {
      return res.json({ success: true, data: [] });
    }

    const posts = await Post.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
};

const getPostStatus = async (req, res, next) => {
  try {
    const { postId, telegramId } = req.query;
    const User = require('../models/User');
    const user = await User.findOne({ telegramId: String(telegramId) });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const post = await Post.findOne({ _id: postId, userId: user._id });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const getPaymentInstructions = async (_req, res) => {
  res.json({ success: true, data: getPaymentInfo() });
};

const getMyPostById = async (req, res, next) => {
  try {
    const { telegramId } = req.query;
    if (!telegramId) {
      return res.status(400).json({ success: false, message: 'Telegram ID is required' });
    }
    const { post } = await getOwnedPost(req.params.id, telegramId);
    res.json({ success: true, data: post });
  } catch (error) {
    if (error.message === 'Published posts cannot be updated right now. Please try again later.') {
      return res.status(503).json({ success: false, message: error.message });
    }
    if (error.message === 'Post not found' || error.message === 'User not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const updateMyPostHandler = async (req, res, next) => {
  try {
    const { telegramId } = req.body;
    if (!telegramId) {
      return res.status(400).json({
        success: false,
        message: 'Telegram user ID is missing',
        fieldErrors: { telegramId: 'Telegram user ID is missing. Open this app from Telegram.' },
      });
    }
    const post = await updateMyPost(req.params.id, telegramId, attachMedicineImage(req.body, req.file));
    res.json({ success: true, data: post, message: 'Post updated' });
  } catch (error) {
    if (error.message === 'Post not found' || error.message === 'User not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    const fieldMap = {
      'Category is required': 'category',
      'Brand is required': 'brand',
      'Strength is required': 'strength',
      'Medicine name is required': 'medicineName',
      'Quantity is required': 'quantity',
      'City is required': 'city',
      'Contact phone is required': 'contactPhone',
      'Price must be greater than 0': 'price',
    };
    if (fieldMap[error.message]) {
      return res.status(400).json({
        success: false,
        message: error.message,
        fieldErrors: { [fieldMap[error.message]]: error.message },
      });
    }
    next(error);
  }
};

const deleteMyPostHandler = async (req, res, next) => {
  try {
    const telegramId = req.body.telegramId || req.query.telegramId;
    if (!telegramId) {
      return res.status(400).json({ success: false, message: 'Telegram ID is required' });
    }
    await deleteMyPost(req.params.id, telegramId);
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    if (error.message === 'Approved posts cannot be deleted') {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message === 'Post not found' || error.message === 'User not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const getCities = async (_req, res, next) => {
  try {
    const cities = await Post.distinct('city', { approvalStatus: 'approved', isActive: { $ne: false } });
    res.json({ success: true, data: cities.sort() });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBuyerPost,
  createSellerPost,
  uploadPayment,
  getApprovedPosts,
  getPostById,
  getMyPosts,
  getMyPostById,
  updateMyPostHandler,
  deleteMyPostHandler,
  getPostStatus,
  getPaymentInstructions,
  getCities,
};
