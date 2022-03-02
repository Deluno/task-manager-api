const bcrypt = require('bcryptjs');
const { ValidationError, Op } = require('sequelize');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.register = (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({
    where: {
      [Op.or]: [{ username: username }, { email: email }],
    },
  })
    .then(async (user) => {
      if (user) return res.status(409).send();
      if (!password) throw new ValidationError('Password is not provided');

      const hashedPassord = await bcrypt.hash(password, 12);
      return User.create({
        username: username,
        email: email,
        password: hashedPassord,
      });
    })
    .then((user) => {
      const accesser = jwt.sign(
        {
          username: user.username,
          role: user.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_LIFE }
      );

      const refresher = jwt.sign(
        {
          username: user.username,
          role: user.role,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_LIFE }
      );
      res.status(201).send({
        accessToken: accesser,
        refreshToken: refresher,
      });
    })
    .catch((error) => {
      if (error instanceof ValidationError) {
        return res.status(400).send();
      }
      res.status(500).send();
    });
};

exports.login = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  let loadedUser;
  User.findByPk(username)
    .then((user) => {
      if (!user) return res.status(404).send();

      loadedUser = user;
      return bcrypt.compare(password, user.password).then((success) => {
        if (!success) return res.status(401).send();

        const accesser = jwt.sign(
          {
            username: loadedUser.username,
            role: loadedUser.role,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_LIFE }
        );

        const refresher = jwt.sign(
          {
            username: loadedUser.username,
            role: loadedUser.role,
          },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: process.env.REFRESH_TOKEN_LIFE }
        );

        res.status(200).json({
          accessToken: accesser,
          refreshToken: refresher,
        });
      });
    })
    .catch(() => res.status(500).send());
};

exports.refresh = (req, res, next) => {
  const refresher = req.body.refreshToken;
  let decodedToken;

  try {
    decodedToken = jwt.verify(refresher, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return res.status(401).send();
  }
  if (!decodedToken) {
    return res.status(401).send();
  }

  const newAccesser = jwt.sign(
    {
      username: decodedToken['username'],
      role: decodedToken['role'],
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_LIFE }
  );

  const newRefresher = jwt.sign(
    {
      username: decodedToken['username'],
      role: decodedToken['role'],
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_LIFE }
  );

  res.status(200).json({
    accessToken: newAccesser,
    refreshToken: newRefresher,
  });
};

exports.isAuth = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) return res.status(401).send();

  const token = authHeader.split(' ')[1];

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    return res.status(401).send();
  }
  req.username = decodedToken['username'];
  req.role = decodedToken['role'];
  next();
};
