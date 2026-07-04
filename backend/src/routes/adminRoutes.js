const express = require('express');
const {
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
} = require('../controllers/adminController');
const {
  listChannels,
  createChannel,
  updateChannel,
  deleteChannel,
} = require('../controllers/channelController');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authAdmin, requireSuperadmin } = require('../middleware/auth');

const router = express.Router();

router.use(authAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/users', listBotUsers);
router.delete('/users/:id', deleteBotUser);
router.get('/admin-users', listAdminUsers);
router.post('/admin-users', requireSuperadmin, createAdminUser);
router.delete('/admin-users/:id', requireSuperadmin, deleteAdminUser);
router.get('/settings', getSettings);
router.patch('/settings', requireSuperadmin, updateSettings);
router.get('/channels', listChannels);
router.post('/channels', createChannel);
router.patch('/channels/:id', updateChannel);
router.delete('/channels/:id', deleteChannel);
router.get('/posts/pending', getPendingPosts);
router.get('/posts', getAllPosts);
router.get('/posts/:id', getPostDetails);
router.patch('/posts/:id', updatePost);
router.patch('/posts/:id/approve', approve);
router.patch('/posts/:id/reject', reject);
router.patch('/posts/:id/active', toggleActive);
router.delete('/posts/:id', deletePost);

module.exports = router;
