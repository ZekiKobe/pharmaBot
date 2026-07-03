const { body, query } = require('express-validator');

const buyerPostRules = [
  body('medicineName').trim().notEmpty().withMessage('Medicine name is required'),
  body('quantity').trim().notEmpty().withMessage('Quantity is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('contactPhone').trim().notEmpty().withMessage('Contact phone is required'),
  body('telegramId').notEmpty().withMessage('Telegram ID is required'),
  body('strength').optional().trim(),
  body('description').optional().trim(),
  body('telegramUsername').optional().trim(),
  body('category').optional().trim(),
];

const sellerPostRules = [
  body('medicineName').trim().notEmpty().withMessage('Medicine name is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('strength').trim().notEmpty().withMessage('Strength is required'),
  body('quantity').trim().notEmpty().withMessage('Quantity is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('expiryDate').notEmpty().withMessage('Expiry date is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('contactPhone').trim().notEmpty().withMessage('Contact phone is required'),
  body('telegramId').notEmpty().withMessage('Telegram ID is required'),
  body('description').optional().trim(),
  body('telegramUsername').optional().trim(),
  body('category').optional().trim(),
];

const loginRules = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const postQueryRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['buyer', 'seller']),
  query('city').optional().trim(),
  query('category').optional().trim(),
  query('search').optional().trim(),
];

module.exports = {
  buyerPostRules,
  sellerPostRules,
  loginRules,
  postQueryRules,
};
