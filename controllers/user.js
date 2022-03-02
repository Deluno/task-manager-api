const bcrypt = require('bcryptjs');
const { ValidationError, Op } = require('sequelize');

const User = require('../models/user');
const utils = require('../utils/helpers');

// GET /users
exports.getUsers = (req, res, next) => {
  if (!utils.isAdmin(req)) return res.status(403).send();
  // const currentPage = req.query.page || 1;
  // if (currentPage < 1) return res.status(400).send();

  // const perPage = +req.query.amount || 10;
  // let totalItems = 0;
  // let totalPages = 0;
  // User.count()
  //   .then((count) => {
  //     totalItems = count;
  //     totalPages = Math.ceil(totalItems / perPage);

  //     const start =
  //       currentPage <= totalPages
  //         ? (currentPage - 1) * perPage
  //         : (totalPages - 1) * perPage;
  //     return User.findAll({ limit: perPage, offset: start });
  //   })
  // .then((users) => {
  //   res.status(200).json({ users: users, totalPages: totalPages });
  // })
  //   .catch(() => res.status(500).send());

  User.findAll({ where: { role: { [Op.not]: 'admin' } } })
    .then((users) => {
      res.status(200).json(users);
    })
    .catch(() => res.status(500).send());
};

// GET /users/:username
exports.getUser = (req, res, next) => {
  const username = req.params.username;
  User.findByPk(username)
    .then((user) => {
      if (!user) return res.status(404).send();
      if (!utils.isUserOrAdmin(user, req)) return res.status(401).send();
      res.status(200).json(user);
    })
    .catch(() => res.status(500).send());
};

// PATCH users/:username
exports.patchUser = (req, res, next) => {
  const username = req.params.username;

  const newUsername = req.body.username || '';
  let newEmail = req.body.email || '';
  let newPassword = req.body.password;

  let currentUser;
  User.findByPk(username)
    .then((user) => {
      if (!user) return res.status(404).send();
      if (!utils.isUserOrAdmin(user, req)) return res.status(401).send();
      currentUser = user;

      return User.findOne({
        where: { [Op.or]: [{ username: newUsername }, { email: newEmail }] },
      });
    })
    .then(async (user) => {
      if (user) return res.status(409).send();
      if (newPassword && newPassword.length > 4) {
        const hashedPassord = await bcrypt.hash(newPassword, 12);
        newPassword = hashedPassord;
      }
      if (newEmail.length === 0) newEmail = currentUser.email;

      return currentUser.update(
        {
          username: newUsername,
          email: newEmail,
          password: newPassword,
        },
        { returning: true, plain: true }
      );
    })
    .then((user) => res.status(200).json(user))
    .catch((error) => {
      if (error instanceof ValidationError) {
        return res.status(400).send();
      }
      console.log(error);
      res.status(500).send();
    });
};

// DELETE users/:username
exports.deleteUser = (req, res, next) => {
  const username = req.params.username;
  User.findByPk(username)
    .then((user) => {
      if (!user) return res.status(404).send();
      if (!utils.isUserOrAdmin(user, req)) return res.status(401).send();
      return user.destroy();
    })
    .then(() => res.status(204).send())
    .catch(() => res.status(500).send());
};
