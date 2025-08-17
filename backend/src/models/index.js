/* eslint-env node */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// User
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  fullName: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false }
});

// Lister
const Lister = sequelize.define('Lister', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  fullName: { type: DataTypes.STRING, allowNull: false },
  businessName: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING, allowNull: false }
});

// ParkingSpace
const ParkingSpace = sequelize.define('ParkingSpace', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  contact: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.STRING, defaultValue: 'Not specified' },
  availability: { type: DataTypes.STRING, defaultValue: 'Not specified' },
  description: { type: DataTypes.TEXT, defaultValue: 'No description provided' },
  lat: { type: DataTypes.FLOAT, allowNull: false },
  lng: { type: DataTypes.FLOAT, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  listerId: { type: DataTypes.INTEGER }
});

// ParkingRequest
const ParkingRequest = sequelize.define('ParkingRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  listerName: { type: DataTypes.STRING, allowNull: false },
  listerEmail: { type: DataTypes.STRING, allowNull: false },
  businessName: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.STRING, allowNull: false },
  availability: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  contact: { type: DataTypes.STRING, allowNull: false },
  lat: { type: DataTypes.FLOAT, allowNull: false },
  lng: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.ENUM('pending','approved','rejected'), defaultValue: 'pending' },
  listerId: { type: DataTypes.INTEGER }
});

// UserQuery
const UserQuery = sequelize.define('UserQuery', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  subject: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  attachmentUrl: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('pending','in-progress','resolved','closed'), defaultValue: 'pending' },
  adminResponse: { type: DataTypes.TEXT },
  userId: { type: DataTypes.INTEGER, allowNull: false }
});

// ListerQuery
const ListerQuery = sequelize.define('ListerQuery', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  subject: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  attachmentUrl: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('pending','in-progress','resolved','closed'), defaultValue: 'pending' },
  adminResponse: { type: DataTypes.TEXT },
  listerId: { type: DataTypes.INTEGER, allowNull: false }
});

// Booking
const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bookingDate: { type: DataTypes.DATE, allowNull: false },
  startTime: { type: DataTypes.TIME, allowNull: false },
  endTime: { type: DataTypes.TIME, allowNull: false },
  status: { type: DataTypes.ENUM('pending','confirmed','completed','cancelled'), defaultValue: 'pending' },
  totalAmount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  paymentStatus: { type: DataTypes.ENUM('pending','paid','refunded'), defaultValue: 'pending' },
  vehicleInfo: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  parkingSpaceId: { type: DataTypes.INTEGER, allowNull: false },
  listerId: { type: DataTypes.INTEGER, allowNull: false }
});

// Relationships
Lister.hasMany(ParkingSpace, { foreignKey: 'listerId' });
ParkingSpace.belongsTo(Lister, { foreignKey: 'listerId' });
Lister.hasMany(ParkingRequest, { foreignKey: 'listerId' });
ParkingRequest.belongsTo(Lister, { foreignKey: 'listerId' });
User.hasMany(UserQuery, { foreignKey: 'userId' });
UserQuery.belongsTo(User, { foreignKey: 'userId' });
Lister.hasMany(ListerQuery, { foreignKey: 'listerId' });
ListerQuery.belongsTo(Lister, { foreignKey: 'listerId' });
User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });
ParkingSpace.hasMany(Booking, { foreignKey: 'parkingSpaceId' });
Booking.belongsTo(ParkingSpace, { foreignKey: 'parkingSpaceId' });
Lister.hasMany(Booking, { foreignKey: 'listerId' });
Booking.belongsTo(Lister, { foreignKey: 'listerId' });

module.exports = { sequelize, User, Lister, ParkingSpace, ParkingRequest, UserQuery, ListerQuery, Booking };
