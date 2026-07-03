const express = require('express');
const {
  getDashboardStats,
  getPendingPosts,
  getAllPosts,
  getPostDetails,
  approve,
  reject,
  getAnalytics,
} = require('../controllers/adminController');
const {
  listChannels,
  createChannel,
  updateChannel,
  deleteChannel,
} = require('../controllers/channelController');
const { authAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/channels', listChannels);
router.post('/channels', createChannel);
router.patch('/channels/:id', updateChannel);
router.delete('/channels/:id', deleteChannel);
router.get('/posts/pending', getPendingPosts);
router.get('/posts', getAllPosts);
router.get('/posts/:id', getPostDetails);
router.patch('/posts/:id/approve', approve);
router.patch('/posts/:id/reject', reject);

module.exports = router;
