const express = require('express');
const {
  getDashboardStats,
  getPendingPosts,
  getAllPosts,
  getPostDetails,
  approve,
  reject,
} = require('../controllers/adminController');
const { authAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/posts/pending', getPendingPosts);
router.get('/posts', getAllPosts);
router.get('/posts/:id', getPostDetails);
router.patch('/posts/:id/approve', approve);
router.patch('/posts/:id/reject', reject);

module.exports = router;
