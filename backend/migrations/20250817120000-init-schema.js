/* eslint-env node */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Users
    await queryInterface.createTable('Users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      fullName: { type: Sequelize.STRING, allowNull: false },
      password: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    // Listers
    await queryInterface.createTable('Listers', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      fullName: { type: Sequelize.STRING, allowNull: false },
      businessName: { type: Sequelize.STRING },
      phone: { type: Sequelize.STRING },
      address: { type: Sequelize.STRING },
      password: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    // ParkingSpaces
    await queryInterface.createTable('ParkingSpaces', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      contact: { type: Sequelize.STRING, allowNull: false },
      location: { type: Sequelize.STRING, allowNull: false },
      price: { type: Sequelize.STRING },
      availability: { type: Sequelize.STRING },
      description: { type: Sequelize.TEXT },
      lat: { type: Sequelize.FLOAT, allowNull: false },
      lng: { type: Sequelize.FLOAT, allowNull: false },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      listerId: { type: Sequelize.INTEGER, references: { model: 'Listers', key: 'id' }, onDelete: 'SET NULL' },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    // ParkingRequests
    await queryInterface.createTable('ParkingRequests', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      listerName: { type: Sequelize.STRING, allowNull: false },
      listerEmail: { type: Sequelize.STRING, allowNull: false },
      businessName: { type: Sequelize.STRING },
      location: { type: Sequelize.STRING, allowNull: false },
      price: { type: Sequelize.STRING, allowNull: false },
      availability: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      contact: { type: Sequelize.STRING, allowNull: false },
      lat: { type: Sequelize.FLOAT, allowNull: false },
      lng: { type: Sequelize.FLOAT, allowNull: false },
      status: { type: Sequelize.ENUM('pending','approved','rejected'), defaultValue: 'pending' },
      listerId: { type: Sequelize.INTEGER, references: { model: 'Listers', key: 'id' }, onDelete: 'SET NULL' },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    // UserQueries
    await queryInterface.createTable('UserQueries', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      subject: { type: Sequelize.STRING, allowNull: false },
      category: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      attachmentUrl: { type: Sequelize.STRING },
      status: { type: Sequelize.ENUM('pending','in-progress','resolved','closed'), defaultValue: 'pending' },
      adminResponse: { type: Sequelize.TEXT },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    // ListerQueries
    await queryInterface.createTable('ListerQueries', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      subject: { type: Sequelize.STRING, allowNull: false },
      category: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      attachmentUrl: { type: Sequelize.STRING },
      status: { type: Sequelize.ENUM('pending','in-progress','resolved','closed'), defaultValue: 'pending' },
      adminResponse: { type: Sequelize.TEXT },
      listerId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Listers', key: 'id' }, onDelete: 'CASCADE' },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    // Bookings
    await queryInterface.createTable('Bookings', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      bookingDate: { type: Sequelize.DATE, allowNull: false },
      startTime: { type: Sequelize.TIME, allowNull: false },
      endTime: { type: Sequelize.TIME, allowNull: false },
      status: { type: Sequelize.ENUM('pending','confirmed','completed','cancelled'), defaultValue: 'pending' },
      totalAmount: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      paymentStatus: { type: Sequelize.ENUM('pending','paid','refunded'), defaultValue: 'pending' },
      vehicleInfo: { type: Sequelize.STRING },
      notes: { type: Sequelize.TEXT },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      parkingSpaceId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'ParkingSpaces', key: 'id' }, onDelete: 'CASCADE' },
      listerId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Listers', key: 'id' }, onDelete: 'CASCADE' },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Bookings');
    await queryInterface.dropTable('ListerQueries');
    await queryInterface.dropTable('UserQueries');
    await queryInterface.dropTable('ParkingRequests');
    await queryInterface.dropTable('ParkingSpaces');
    await queryInterface.dropTable('Listers');
    await queryInterface.dropTable('Users');
  }
};
