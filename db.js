const { Pool } = require('pg');
const dotenv = require("dotenv").config();
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const dbPassword = process.env.DBPASSWORD;

const pool = new Pool({
  user: 'postgres',
  password: dbPassword,
  host: 'localhost',
  port: 5432,
  database: 'dbname',
});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Error connecting to the database', err));

const sessionStore = new pgSession({
  pool: pool, // Pass the pool to the session store
  tableName: 'sessions' // Specify the table name for sessions
});

module.exports = { pool, sessionStore };
