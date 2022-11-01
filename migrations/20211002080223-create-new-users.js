'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      'new_users',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT,
        },
        firstName: {
          type: Sequelize.STRING,
          field: 'first_name',
          allowNull: false,
        },
        refById: {
          type: Sequelize.BIGINT,
          field: 'ref_by_id',
          allowNull: false,
        },
        refType: {
          type: Sequelize.STRING,
          field: 'ref_type',
          allowNull: false,
        },
        status: {
          type: Sequelize.BOOLEAN,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          field: `created_at`,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          field: `updated_at`,
        },
      },
      {
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
            fields: ['status'],
          },
        ],
      }
    );
    await queryInterface.addIndex('new_users', ['ref_by_id']);
    await queryInterface.addIndex('new_users', ['status']);
    await queryInterface.addIndex('new_users', ['ref_type']);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('new_users');
  },
};
