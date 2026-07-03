const express = require('express');
const {
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
} = require('../controllers/postController');
const {
  buyerPostRules,
  sellerPostRules,
  paymentUploadRules,
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
router.get('/my/:id', getMyPostById);
router.patch('/my/:id', updateMyPostHandler);
router.delete('/my/:id', deleteMyPostHandler);
router.get('/:id', getPostById);

router.post('/buyer', buyerPostRules, validate, createBuyerPost);
router.post('/seller', sellerPostRules, validate, createSellerPost);
router.post('/payment', upload.single('screenshot'), paymentUploadRules, validate, uploadPayment);

module.exports = router;
