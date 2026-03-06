"use strict";

// questo file mi serve per creare una connessione MySQL condivisa, cosi non apro connessioni duplicate in ogni repository.

const mysql = require("mysql2/promise");
const env = require("./env");

// mi serve per creare un pool riusabile e limitare il numero di connessioni concorrenti.
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

// mi serve per eseguire query parametrizzate (prepared statements) contro il database.
async function query(sql, params = []) {
  // lo uso per passare sempre i parametri separati dalla query e prevenire SQL injection.
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = {
  pool,
  query
};
