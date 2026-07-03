const { body, query } = require('express-validator');

const phoneRule = body('contactPhone')
  .trim()
  .notEmpty()
  .withMessage('Contact phone is required')
  .custom((value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 13) {
      throw new Error('Enter a valid phone number (e.g. 0911234567)');
    }
    return true;
  });

const telegramIdRule = body('telegramId')
  .notEmpty()
  .withMessage('Telegram user ID is missing — open the app from Telegram');

const buyerPostRules = [
  body('medicineName').trim().notEmpty().withMessage('Medicine name is required'),
  body('quantity').trim().notEmpty().withMessage('Quantity is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  phoneRule,
  telegramIdRule,
  body('strength').optional({ values: 'falsy' }).trim(),
  body('description').optional({ values: 'falsy' }).trim(),
  body('telegramUsername').optional({ values: 'falsy' }).trim(),
  body('category').optional({ values: 'falsy' }).trim(),
  body('fullName').optional({ values: 'falsy' }).trim(),
];

const sellerPostRules = [
  body('medicineName').trim().notEmpty().withMessage('Medicine name is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('strength').trim().notEmpty().withMessage('Strength is required'),
  body('quantity').trim().notEmpty().withMessage('Quantity is required'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .custom((value) => {
      const num = Number(value);
      if (Number.isNaN(num)) throw new Error('Price must be a valid number');
      if (num <= 0) throw new Error('Price must be greater than 0');
      return true;
    }),
  body('expiryDate')
    .notEmpty()
    .withMessage('Expiry date is required')
    .custom((value) => {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) {
        throw new Error('Expiry date must be a valid date');
      }
      return true;
    }),
  body('city').trim().notEmpty().withMessage('City is required'),
  phoneRule,
  telegramIdRule,
  body('description').optional({ values: 'falsy' }).trim(),
  body('telegramUsername').optional({ values: 'falsy' }).trim(),
  body('category').optional({ values: 'falsy' }).trim(),
  body('fullName').optional({ values: 'falsy' }).trim(),
];

const paymentUploadRules = [
  body('postId').notEmpty().withMessage('Post ID is required'),
  body('telegramId').notEmpty().withMessage('Telegram user ID is missing'),
];

const loginRules = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const postQueryRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['buyer', 'seller']).withMessage('Type must be buyer or seller'),
  query('city').optional().trim(),
  query('category').optional().trim(),
  query('search').optional().trim(),
];

module.exports = {
  buyerPostRules,
  sellerPostRules,
  paymentUploadRules,
  loginRules,
  postQueryRules,
};
