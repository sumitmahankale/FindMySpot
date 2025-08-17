/* eslint-env node */
const { Sequelize } = require('sequelize');

const DB_DIALECT = (process.env.DB_DIALECT || 'mysql').toLowerCase();

// If Railway provides a full URL (e.g., MYSQL_URL), prefer it.
const RAILWAY_URL = process.env.MYSQL_URL || process.env.DATABASE_URL;

let sequelize;
if (RAILWAY_URL) {
  sequelize = new Sequelize(RAILWAY_URL, {
    dialect: DB_DIALECT === 'sqlite' ? 'sqlite' : 'mysql',
    dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    logging: false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  const options = {
    dialect: DB_DIALECT,
    logging: false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };
  if (DB_DIALECT === 'sqlite') {
    options.storage = process.env.DB_STORAGE || 'database.sqlite';
  } else {
    options.host = process.env.DB_HOST || 'localhost';
    options.username = process.env.DB_USER || 'root';
    options.password = process.env.DB_PASSWORD || '';
    options.database = process.env.DB_NAME || 'FindMySpot';
    if (process.env.DB_SSL === 'true') {
      options.dialectOptions = { ssl: { require: true, rejectUnauthorized: false } };
    }
  }
  sequelize = new Sequelize(options);
}

module.exports = { sequelize };
