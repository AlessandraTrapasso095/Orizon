"use strict";

// questo file mi serve per incapsulare tutte le query dei prodotti in un punto unico e mantenere il codice DRY.

const db = require("../config/database");

// mi serve per creare un prodotto con query parametrizzata sicura.
async function createProduct(name) {
  const sql = "INSERT INTO products (name) VALUES (?)";
  const result = await db.query(sql, [name]);
  return result.insertId;
}

// mi serve per leggere un prodotto tramite id.
async function findProductById(id) {
  const sql = "SELECT id, name, created_at, updated_at FROM products WHERE id = ?";
  const rows = await db.query(sql, [id]);
  return rows[0] || null;
}

// mi serve per controllare duplicati di nome in fase di validazione business.
async function findProductByName(name) {
  const sql = "SELECT id, name, created_at, updated_at FROM products WHERE name = ?";
  const rows = await db.query(sql, [name]);
  return rows[0] || null;
}

// mi serve per aggiornare il nome prodotto in modo sicuro.
async function updateProduct(id, name) {
  const sql = "UPDATE products SET name = ? WHERE id = ?";
  const result = await db.query(sql, [name, id]);
  return result.affectedRows;
}

// mi serve per cancellare un prodotto tramite id.
async function deleteProduct(id) {
  const sql = "DELETE FROM products WHERE id = ?";
  const result = await db.query(sql, [id]);
  return result.affectedRows;
}

module.exports = {
  createProduct,
  findProductById,
  findProductByName,
  updateProduct,
  deleteProduct
};
