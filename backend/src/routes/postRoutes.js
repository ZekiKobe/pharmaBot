const express = require('express');
const {
  createBuyerPost,
  createSellerPost,
  uploadPayment,
  getApprovedPosts,
  getPostById,
  getMyPosts,
  getPostStatus,
  getPaymentInstructions,
  getCities,
} = require('../controllers/postController');
const {
  buyerPostRules,
  sellerPostRules,
  postQueryRules,
} = require('../validators/postValidators');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/payment-info', getPaymentInstructions);
router.get('/cities', getCities);
router.get('/', postQueryRules, validate, getApprovedPosts);
router.get('/status', getPostStatus);
router.get('/user/:telegramId', getMyPosts);
router.get('/:id', getPostById);

router.post('/buyer', buyerPostRules, validate, createBuyerPost);
router.post('/seller', sellerPostRules, validate, createSellerPost);
router.post('/payment', upload.single('screenshot'), uploadPayment);

module.exports = router;
