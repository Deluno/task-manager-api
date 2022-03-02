const express = require('express');

const authController = require('../controllers/auth');
// const errorController = require('../controllers/error');

const router = express.Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/refresh', authController.refresh);

module.exports = router;