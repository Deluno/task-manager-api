const { Sequelize } = require('sequelize');

exports.sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    port: process.env.MYSQL_PORT,
    dialect: 'mysql',
    host: process.env.MYSQL_HOST,
    define: {
      timestamps: false,
    },
  }
);

const User = require('../models/user');
const Task = require('../models/task');
const File = require('../models/file');

exports.setRelations = () => {
  User.hasMany(Task, {
    foreignKey: 'usr',
    constraints: true,
    onDelete: 'CASCADE',
  });

  Task.hasMany(File, {
    foreignKey: 'tid',
    constraints: true,
    onDelete: 'CASCADE',
  });
};
