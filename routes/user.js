const express = require('express');

const userController = require('../controllers/user');
const authController = require('../controllers/auth');
const errorController = require('../controllers/error');

const router = express.Router();

router.get('/', authController.isAuth, userController.getUsers);

router.patch('/', errorController.methodNotAllowed);

router.delete('/', errorController.methodNotAllowed);

router.get('/:username', authController.isAuth, userController.getUser);

router.patch('/:username', authController.isAuth, userController.patchUser);

router.delete('/:username', authController.isAuth, userController.deleteUser);

module.exports = router;
