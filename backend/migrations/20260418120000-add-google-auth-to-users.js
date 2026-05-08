/* eslint-env node */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'googleId', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'authProvider', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'local'
    });

    await queryInterface.addIndex('Users', ['googleId'], {
      unique: true,
      name: 'users_google_id_unique'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Users', 'users_google_id_unique');
    await queryInterface.removeColumn('Users', 'authProvider');
    await queryInterface.removeColumn('Users', 'googleId');
  }
};