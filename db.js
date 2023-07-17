const mysql = require('mysql2/promise');
const dotenv = require('dotenv').config();


const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smartdawa',
  port: 3306,
});

module.exports = pool;
