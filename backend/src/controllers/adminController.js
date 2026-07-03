const Post = require('../models/Post');
const Payment = require('../models/Payment');
const { approvePost, rejectPost } = require('../services/postService');

const getDashboardStats = async (_req, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalPosts,
      pendingPosts,
      approvedPosts,
      rejectedPosts,
      totalRevenue,
      dailyRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ approvalStatus: 'pending' }),
      Post.countDocuments({ approvalStatus: 'approved' }),
      Post.countDocuments({ approvalStatus: 'rejected' }),
      Payment.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'approved', reviewedAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'approved', reviewedAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalPosts,
        pendingPosts,
        approvedPosts,
        rejectedPosts,
        totalRevenue: totalRevenue[0]?.total || 0,
        dailyRevenue: dailyRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPendingPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ approvalStatus: 'pending' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'telegramId username fullName phoneNumber'),
      Post.countDocuments({ approvalStatus: 'pending' }),
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

const getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.approvalStatus) filter.approvalStatus = req.query.approvalStatus;
    if (req.query.type) filter.type = req.query.type;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'telegramId username fullName'),
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

const getPostDetails = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'userId',
      'telegramId username fullName phoneNumber'
    );

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const payment = await Payment.findOne({ postId: post._id });

    res.json({ success: true, data: { post, payment } });
  } catch (error) {
    next(error);
  }
};

const approve = async (req, res, next) => {
  try {
    const post = await approvePost(req.params.id, req.admin._id);
    res.json({ success: true, data: post, message: 'Post approved and published' });
  } catch (error) {
    next(error);
  }
};

const reject = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }
    const post = await rejectPost(req.params.id, reason.trim(), req.admin._id);
    res.json({ success: true, data: post, message: 'Post rejected' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getPendingPosts,
  getAllPosts,
  getPostDetails,
  approve,
  reject,
};
