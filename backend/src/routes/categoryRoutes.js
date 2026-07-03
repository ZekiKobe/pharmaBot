const express = require('express');
const {
  getCategories,
  createCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { authAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getCategories);
router.post('/', authAdmin, createCategory);
router.delete('/:id', authAdmin, deleteCategory);

module.exports = router;
