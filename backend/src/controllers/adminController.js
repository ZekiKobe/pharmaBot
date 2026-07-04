const Post = require('../models/Post');
const Payment = require('../models/Payment');
const User = require('../models/User');
const AdminUser = require('../models/AdminUser');
const {
  approvePost,
  rejectPost,
  adminDeletePost,
  setPostActive,
  updatePostByAdmin,
} = require('../services/postService');

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
    if (req.query.isActive === 'true') filter.isActive = { $ne: false };
    if (req.query.isActive === 'false') filter.isActive = false;

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

const updatePost = async (req, res, next) => {
  try {
    const post = await updatePostByAdmin(req.params.id, req.body);
    res.json({ success: true, data: post, message: 'Post updated successfully' });
  } catch (error) {
    if (error.message === 'Post not found') {
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
      'Published posts cannot be updated right now. Please try again later.': 'medicineName',
    };
    if (fieldMap[error.message]) {
      return res.status(error.message.includes('right now') ? 503 : 400).json({
        success: false,
        message: error.message,
        fieldErrors: { [fieldMap[error.message]]: error.message },
      });
    }
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

const deletePost = async (req, res, next) => {
  try {
    await adminDeletePost(req.params.id);
    res.json({ success: true, message: 'Post permanently deleted' });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const toggleActive = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be true or false' });
    }
    const post = await setPostActive(req.params.id, isActive);
    res.json({
      success: true,
      data: post,
      message: isActive ? 'Post activated and visible again' : 'Post deactivated and hidden from marketplace',
    });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'Only approved posts can be activated or deactivated') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const listBotUsers = async (req, res, next) => {
  try {
    const search = String(req.query.search || '').trim();
    const filter = search
      ? {
          $or: [
            { username: new RegExp(search, 'i') },
            { fullName: new RegExp(search, 'i') },
            { telegramId: new RegExp(search, 'i') },
            { phoneNumber: new RegExp(search, 'i') },
          ],
        }
      : {};

    const users = await User.find(filter).sort({ createdAt: -1 }).lean();
    const userIds = users.map((user) => user._id);
    const postCounts = await Post.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: '$userId',
          totalPosts: { $sum: 1 },
          approvedPosts: {
            $sum: {
              $cond: [{ $eq: ['$approvalStatus', 'approved'] }, 1, 0],
            },
          },
        },
      },
    ]);
    const countsMap = new Map(postCounts.map((item) => [String(item._id), item]));

    res.json({
      success: true,
      data: users.map((user) => {
        const counts = countsMap.get(String(user._id));
        return {
          ...user,
          totalPosts: counts?.totalPosts || 0,
          approvedPosts: counts?.approvedPosts || 0,
        };
      }),
    });
  } catch (error) {
    next(error);
  }
};

const deleteBotUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const postCount = await Post.countDocuments({ userId: user._id });
    if (postCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a bot user who still has posts.',
      });
    }

    await User.findByIdAndDelete(user._id);
    res.json({ success: true, message: 'Bot user removed' });
  } catch (error) {
    next(error);
  }
};

const listAdminUsers = async (_req, res, next) => {
  try {
    const admins = await AdminUser.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: admins });
  } catch (error) {
    next(error);
  }
};

const createAdminUser = async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const role = req.body.role === 'superadmin' ? 'superadmin' : 'admin';
    const fieldErrors = {};

    if (!username) fieldErrors.username = 'Username is required';
    if (!password) fieldErrors.password = 'Password is required';
    else if (password.length < 6) fieldErrors.password = 'Password must be at least 6 characters';

    if (Object.keys(fieldErrors).length) {
      return res.status(400).json({
        success: false,
        message: 'Please correct the admin form.',
        fieldErrors,
      });
    }

    const admin = await AdminUser.create({ username, password, role });
    res.status(201).json({
      success: true,
      data: { id: admin._id, username: admin.username, role: admin.role, createdAt: admin.createdAt },
      message: 'Admin user created',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This username is already in use.',
        fieldErrors: { username: 'This username is already in use.' },
      });
    }
    next(error);
  }
};

const deleteAdminUser = async (req, res, next) => {
  try {
    if (String(req.admin._id) === String(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.',
      });
    }

    const admin = await AdminUser.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }

    if (admin.role === 'superadmin') {
      const superadminCount = await AdminUser.countDocuments({ role: 'superadmin' });
      if (superadminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'At least one superadmin account must remain.',
        });
      }
    }

    await AdminUser.findByIdAndDelete(admin._id);
    res.json({ success: true, message: 'Admin user removed' });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (_req, res, next) => {
  try {
    const days = 7;
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const [postsAgg, revenueAgg, byType, byStatus] = await Promise.all([
      Post.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Payment.aggregate([
        { $match: { status: 'approved', reviewedAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$reviewedAt' } },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Post.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      Post.aggregate([{ $group: { _id: '$approvalStatus', count: { $sum: 1 } } }]),
    ]);

    const postsByDay = [];
    const revenueByDay = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      postsByDay.push({
        date: key,
        label,
        count: postsAgg.find((p) => p._id === key)?.count || 0,
      });
      revenueByDay.push({
        date: key,
        label,
        amount: revenueAgg.find((r) => r._id === key)?.total || 0,
      });
    }

    res.json({
      success: true,
      data: {
        postsByDay,
        revenueByDay,
        byType: byType.map((t) => ({ name: t._id, value: t.count })),
        byStatus: byStatus.map((s) => ({ name: s._id, value: s.count })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getPendingPosts,
  getAllPosts,
  updatePost,
  getPostDetails,
  approve,
  reject,
  deletePost,
  toggleActive,
  getAnalytics,
  listBotUsers,
  deleteBotUser,
  listAdminUsers,
  createAdminUser,
  deleteAdminUser,
};
