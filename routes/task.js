const express = require('express');

const taskController = require('../controllers/task');
const authController = require('../controllers/auth');
const errorController = require('../controllers/error');
const { query, validationResult } = require('express-validator');

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  authController.isAuth,
  query('start').optional().trim().isDate(),
  query('end').optional().trim().isDate(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send();
    }
    next();
  },
  taskController.getTasks
);

router.post('/', authController.isAuth, taskController.postTask);

router.patch('/', errorController.methodNotAllowed);

router.delete('/', errorController.methodNotAllowed);

router.get('/:tid', authController.isAuth, taskController.getTask);

router.patch('/:tid', authController.isAuth, taskController.patchTask);

router.delete('/:tid', authController.isAuth, taskController.deleteTask);

module.exports = router;
