/* Sequelize CLI configuration for migrations */
require('dotenv').config();

const dialect = (process.env.DB_DIALECT || 'mysql').toLowerCase();

const common = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'findmyspot',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT,10) : 3306,
  dialect,
  logging: false,
  dialectOptions: {}
};

if (process.env.MYSQL_URL) {
  module.exports = {
    production: { url: process.env.MYSQL_URL, dialect, logging: false },
    development: { url: process.env.MYSQL_URL, dialect, logging: false },
    test: { url: process.env.MYSQL_URL, dialect, logging: false }
  };
} else {
  module.exports = {
    development: common,
    test: { ...common, database: `${common.database}_test` },
    production: common
  };
}
