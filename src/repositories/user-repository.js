"use strict";

// incapsula tutte le query utenti

const db = require("../config/database");

// crea utente con dati anagrafici base
async function createUser(firstName, lastName, email) {
  const sql = "INSERT INTO users (first_name, last_name, email) VALUES (?, ?, ?)";
  const result = await db.query(sql, [firstName, lastName, email]);
  return result.insertId;
}

// mi serve per trovare un utente tramite id
async function findUserById(id) {
  const sql = "SELECT id, first_name, last_name, email, created_at, updated_at FROM users WHERE id = ?";
  const rows = await db.query(sql, [id]);
  return rows[0] || null;
}

// mi serve per verificare email duplicate prima della creazione/aggiornamento
async function findUserByEmail(email) {
  const sql = "SELECT id, first_name, last_name, email, created_at, updated_at FROM users WHERE email = ?";
  const rows = await db.query(sql, [email]);
  return rows[0] || null;
}

// mi serve per aggiornare i dati utente in modo atomico
async function updateUser(id, firstName, lastName, email) {
  const sql = "UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?";
  const result = await db.query(sql, [firstName, lastName, email, id]);
  return result.affectedRows;
}

// mi serve per cancellare un utente tramite id
async function deleteUser(id) {
  const sql = "DELETE FROM users WHERE id = ?";
  const result = await db.query(sql, [id]);
  return result.affectedRows;
}

module.exports = {
  createUser,
  findUserById,
  findUserByEmail,
  updateUser,
  deleteUser
};
