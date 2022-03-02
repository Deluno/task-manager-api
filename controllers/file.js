const fs = require('fs');
const path = require('path');

const { ValidationError } = require('sequelize');

const File = require('../models/file');
const Task = require('../models/task');
const User = require('../models/user');
const utils = require('../utils/helpers');

// GET /users/:username/tasks/:tid/files
exports.getFiles = (req, res, next) => {
  const username = req.params.username;
  const tid = req.params.tid;

  User.findByPk(username, { include: Task })
    .then((user) => {
      if (!user) return res.status(404).send();
      if (!utils.isUserOrAdmin(user, req)) return res.status(401).send();
      return user.getTasks({ where: { id: tid }, include: File });
    })
    .then(([task]) => {
      if (!task) return res.status(404).send();
      res.status(200).json(task.files);
    })
    .catch((err) => {
      if (err instanceof ValidationError) {
        return res.status(400).send();
      }
      res.status(500).send();
    });
};

// POST /users/:username/tasks/:tid/files
exports.postFile = (req, res, next) => {
  const username = req.params.username;
  const tid = req.params.tid;

  if (!req.file) return res.status(400).send();

  const fileName = req.file.originalname;
  const filePath = req.file.path;

  User.findByPk(username)
    .then((user) => {
      if (!user) return res.status(404).send();
      if (!utils.isUserOrAdmin(user, req)) return res.status(401).send();
      return user.getTasks({ where: { id: tid } });
    })
    .then(([task]) => {
      if (!task) return res.status(404).send();
      return task.createFile({ name: fileName, path: filePath });
    })
    .then((file) => res.status(201).send(file))
    .catch((err) => {
      if (err instanceof ValidationError) {
        return res.status(400).send();
      }
      res.status(500).send();
    });
};

// GET /users/:username/tasks/:tid/files/:fid
exports.getFile = (req, res, next) => {
  const username = req.params.username;
  const tid = req.params.tid;
  const fid = req.params.fid;

  User.findByPk(username)
    .then((user) => {
      if (!user) return res.status(404).send();
      if (!utils.isUserOrAdmin(user, req)) return res.status(401).send();
      return user.getTasks({ where: { id: tid } });
    })
    .then(([task]) => {
      if (!task) return res.status(404).send();
      return task.getFiles({ where: { id: fid } });
    })
    .then(([file]) => {
      if (!file) return res.status(404).send();
      const result = path.join(__rootdir, file.path);
      res.setHeader('Content-Type', 'application/octet-stream');
      return res.download(result);
    })
    .catch((err) => {
      if (err instanceof ValidationError) {
        return res.status(400).send();
      }
      console.log(err);
      res.status(500).send();
    });
};

// PATCH /users/:username/tasks/:tid/files/:fid
exports.patchFile = (req, res, next) => {
  const username = req.params.username;
  const tid = req.params.tid;
  const fid = req.params.fid;

  const fileOriginalName = req.body.name;

  User.findByPk(username)
    .then((user) => {
      if (!user) return res.status(404).send();
      if (!utils.isUserOrAdmin(user, req)) return res.status(401).send();
      return user.getTasks({ where: { id: tid } });
    })
    .then(([task]) => {
      if (!task) return res.status(404).send();
      return task.getFiles({ where: { id: fid } });
    })
    .then(([file]) => {
      if (!file) return res.status(404).send();
      return file.update(
        { name: fileOriginalName },
        { returning: true, plain: true }
      );
    })
    .then((file) => res.status(200).json(file))
    .catch((err) => {
      if (err instanceof ValidationError) {
        return res.status(400).send();
      }
      console.log(err);
      res.status(500).send();
    });
};

// DELETE /users/:username/tasks/:tid/files/:fid
exports.deleteFile = (req, res, next) => {
  const username = req.params.username;
  const tid = req.params.tid;
  const fid = req.params.fid;

  User.findByPk(username)
    .then((user) => {
      if (!user) return res.status(404).send();
      if (!utils.isUserOrAdmin(user, req)) return res.status(401).send();
      return user.getTasks({ where: { id: tid } });
    })
    .then(([task]) => {
      if (!task) return res.status(404).send();
      return task.getFiles({ where: { id: fid } });
    })
    .then(([file]) => {
      if (!file) return res.status(404).send();
      fs.unlink(file.path, (err) => {
        if (err) console.log(err);
      });
      return file.destroy();
    })
    .then(() => res.status(204).send())
    .catch((err) => {
      if (err instanceof ValidationError) {
        return res.status(400).send();
      }
      res.status(500).send();
    });
};
