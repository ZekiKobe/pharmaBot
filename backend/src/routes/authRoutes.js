const express = require('express');
const { login, getProfile, changePassword } = require('../controllers/authController');
const { loginRules } = require('../validators/postValidators');
const validate = require('../middleware/validate');
const { authAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/login', loginRules, validate, login);
router.get('/me', authAdmin, getProfile);
router.patch('/password', authAdmin, changePassword);

module.exports = router;
