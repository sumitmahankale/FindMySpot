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
  // Support Railway style env var names (MYSQLHOST, MYSQLUSER, etc.) transparently
  const derivedHost = process.env.DB_HOST || process.env.MYSQLHOST;
  const derivedUser = process.env.DB_USER || process.env.MYSQLUSER;
  const derivedPassword = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD;
  const derivedName = process.env.DB_NAME || process.env.MYSQLDATABASE;

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
  options.host = derivedHost || 'localhost';
  options.username = derivedUser || 'root';
  options.password = derivedPassword || '';
  options.database = derivedName || 'FindMySpot';
    if (process.env.DB_SSL === 'true') {
      options.dialectOptions = { ssl: { require: true, rejectUnauthorized: false } };
    }
  }
  sequelize = new Sequelize(options);
}

module.exports = { sequelize };
