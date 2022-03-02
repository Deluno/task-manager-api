const { DataTypes, Model } = require('sequelize');

const db = require('../utils/database');

class Task extends Model {}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },

    datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    title: {
      type: DataTypes.STRING,
    },

    description: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize: db.sequelize,
    modelName: 'task',
  }
);

module.exports = Task;
