const { DataTypes, Model } = require('sequelize');

const db = require('../utils/database');

class File extends Model {}

File.init(
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},

		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},

		path: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		sequelize: db.sequelize,
		modelName: 'file',
	}
);

module.exports = File;
