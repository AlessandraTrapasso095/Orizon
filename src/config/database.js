"use strict";

// connessione MySQL 

const mysql = require("mysql2/promise");
const env = require("./env");

// pool riusabile e limitando il numero di connessioni concorrenti
const pool = mysql.createPool({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  connectionLimit: env.dbConnectionLimit,
  waitForConnections: true,
  queueLimit: 0,
  namedPlaceholders: false
});

// query parametrizzate contro il database
async function query(sql, params = []) {
  // lo uso per passare sempre i parametri separati dalla query e prevenire SQL injection
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = {
  pool,
  query
};
