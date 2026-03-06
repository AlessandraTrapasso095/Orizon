"use strict";

// serve per leggere e validare le variabili ambiente 

const dotenv = require("dotenv");

dotenv.config();

// mi serve per centralizzare i valori di configurazione usati dal backend
const env = {
  port: Number(process.env.PORT) || 3000,
  dbHost: process.env.DB_HOST || "127.0.0.1",
  dbPort: Number(process.env.DB_PORT) || 3306,
  dbUser: process.env.DB_USER || "root",
  dbPassword: process.env.DB_PASSWORD || "",
  dbName: process.env.DB_NAME || "orizon",
  dbConnectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10
};

module.exports = env;
