
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  username: 'root',
  password: 'Nrtaoswikap_1',
  database: 'crypto_exchange',
  logging: false
});

module.exports = sequelize;