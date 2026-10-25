const { Sequelize } = require('sequelize');
require('dotenv').config();

// Bancos hospedados (ex.: Supabase) exigem SSL. Ative com DB_SSL=true;
// no ambiente local deixe ausente ou false para manter o comportamento atual.
const usarSSL = process.env.DB_SSL === 'true';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    ...(usarSSL
      ? { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } }
      : {})
  }
);

module.exports = sequelize;
