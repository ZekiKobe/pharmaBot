const express = require('express');
const {
  getDashboardStats,
  getPendingPosts,
  getAllPosts,
  getPostDetails,
  approve,
  reject,
  deletePost,
  toggleActive,
  getAnalytics,
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
router.get('/settings', getSettings);
router.patch('/settings', requireSuperadmin, updateSettings);
router.get('/channels', listChannels);
router.post('/channels', createChannel);
router.patch('/channels/:id', updateChannel);
router.delete('/channels/:id', deleteChannel);
router.get('/posts/pending', getPendingPosts);
router.get('/posts', getAllPosts);
router.get('/posts/:id', getPostDetails);
router.patch('/posts/:id/approve', approve);
router.patch('/posts/:id/reject', reject);
router.patch('/posts/:id/active', toggleActive);
router.delete('/posts/:id', deletePost);

module.exports = router;
