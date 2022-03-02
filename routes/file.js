const express = require('express');

const fileController = require('../controllers/file');
const authController = require('../controllers/auth');
const errorController = require('../controllers/error');

const router = express.Router({ mergeParams: true });

router.get('/', authController.isAuth, fileController.getFiles);

router.post('/', authController.isAuth, fileController.postFile);

router.patch('/', errorController.methodNotAllowed);

router.delete('/', errorController.methodNotAllowed);

router.get('/:fid', authController.isAuth, fileController.getFile);

router.patch('/:fid', authController.isAuth, fileController.patchFile);

router.delete('/:fid', authController.isAuth, fileController.deleteFile);

module.exports = router;
