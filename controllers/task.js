const fs = require('fs');

const { ValidationError, Op } = require('sequelize');

const User = require('../models/user');
const Task = require('../models/task');
const utils = require('../utils/helpers');
const File = require('../models/file');

// GET /users/:user/tasks
exports.getTasks = (req, res, next) => {
  const username = req.params.username;
  const start = req.query.start;
  const end = req.query.end;
  const allFlag = req.query.all || !start;

  let startDate, endDate;
  if (!allFlag) {
    const date = new Date();
    startDate = start
      ? new Date(start)
      : new Date(date.getFullYear(), date.getMonth(), date.getDate());

    endDate = end
      ? new Date(end)
      : new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate() + 1
        );
  }

  if (startDate > endDate) return res.status(400).send();

  User.findByPk(username)
    .then((user) => {
      if (!user) return res.status(404).send();
      if (!utils.isUserOrAdmin(user, req)) return res.status(401).send();

      if (allFlag) return user.getTasks();

      return Task.findAll({
        where: { datetime: { [Op.between]: [startDate, endDate] } },
      });
    })
    .then((tasks) => {
      return res.status(200).json(tasks);
    })
    .catch(() => res.status(500).send());
};

// POST /users/:user/tasks
exports.postTask = (req, res, next) => {
  const username = req.params.username;
  User.findByPk(username)
    .then((user) => {
      if (!user) return res.status(404).send();
      if (!utils.isUserOrAdmin(user, req)) return res.status(401).send();
      return user.createTask(req.body);
    })
    .then((task) => res.status(201).send(task))
    .catch((error) => {
      if (error instanceof ValidationError) {
        return res.status(400).send();
      }
      res.status(500).send();
    });
};

// GET /users/:user/tasks/:tid
exports.getTask = (req, res, next) => {
  let username = req.params.username;
  let tid = req.params.tid;
  User.findByPk(username)
    .then((user) => {
      if (!user) return res.status(404).send();
      if (!utils.isUserOrAdmin(user, req)) return res.status(401).send();
      return user.getTasks({ where: { id: tid } });
    })
    .then(([task]) => {
      if (!task) return res.status(404).send();
      return res.status(200).json(task);
    })
    .catch(() => res.status(500).send());
};

// PATCH /users/:user/tasks/:tid
exports.patchTask = (req, res, next) => {
  const username = req.params.username;
  const tid = req.params.tid;

  User.findByPk(username)
    .then((user) => {
      if (!user) return res.status(404).send();
      if (!utils.isUserOrAdmin(user, req)) return res.status(401).send();
      return user.getTasks({ where: { id: tid } });
    })
    .then(([task]) => {
      if (!task) return res.status(404).send();
      return task.update(req.body, { returning: true, plain: true });
    })
    .then((task) => res.status(200).json(task))
    .catch((error) => {
      if (error instanceof ValidationError) {
        return res.status(400).send();
      }
      res.status(500).send();
    });
};

// DELETE /users/:user/tasks/:tid
exports.deleteTask = (req, res, next) => {
  const username = req.params.username;
  const tid = req.params.tid;

  User.findByPk(username)
    .then((user) => {
      if (!user) return res.status(404).send();
      if (!utils.isUserOrAdmin(user, req)) return res.status(401).send();
      return user.getTasks({ where: { id: tid } });
    })
    .then(([task]) => {
      if (!task) return res.status(404).send();

      return File.findAll({ where: { tid: task.id } }).then((files) => {
        for (const file of files) {
          fs.unlink(file.path, (err) => {
            if (err) console.log(err);
          });
        }
        return task.destroy();
      });
    })
    .then(() => res.status(204).send())
    .catch(() => res.status(500).send());
};
