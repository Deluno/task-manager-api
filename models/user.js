const { DataTypes, Model } = require('sequelize');

const db = require('../utils/database');

class User extends Model {}

User.init(
	{
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},

		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},

		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},

		role: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'user',
		},
	},
	{
		sequelize: db.sequelize,
		modelName: 'user',
	}
);

module.exports = User;
