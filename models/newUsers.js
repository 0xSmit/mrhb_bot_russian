'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class newUsers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  newUsers.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      firstName: {
        type: DataTypes.STRING,
        field: 'first_name',
        allowNull: false,
      },
      refById: {
        type: DataTypes.BIGINT,
        field: 'ref_by_id',
        allowNull: false,
      },
      refType: {
        type: DataTypes.STRING,
        field: 'ref_type',
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: `created_at`,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: `updated_at`,
      },
    },
    {
      sequelize,
      underscore: true,
      underscoredAll: true,
      tableName: `new_users`,
      modelName: 'newUsers',
      indexes: [
        {
          unique: false,
          fields: ['ref_by_id'],
        },
        {
          unique: false,
          fields: ['id'],
        },
        {
          unique: false,
          fields: ['status'],
        },
      ],
    }
  );
  return newUsers;
};
