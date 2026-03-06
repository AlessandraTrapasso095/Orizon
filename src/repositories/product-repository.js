"use strict";

// incapsula tutte le query dei prodotti 

const db = require("../config/database");

// mi serve per creare un prodotto con query 
async function createProduct(name) {
  const sql = "INSERT INTO products (name) VALUES (?)";
  const result = await db.query(sql, [name]);
  return result.insertId;
}

// legge un prodotto tramite id
async function findProductById(id) {
  const sql = "SELECT id, name, created_at, updated_at FROM products WHERE id = ?";
  const rows = await db.query(sql, [id]);
  return rows[0] || null;
}

// controlla duplicati 
async function findProductByName(name) {
  const sql = "SELECT id, name, created_at, updated_at FROM products WHERE name = ?";
  const rows = await db.query(sql, [name]);
  return rows[0] || null;
}

// mi serve per aggiornare il nome prodotto 
async function updateProduct(id, name) {
  const sql = "UPDATE products SET name = ? WHERE id = ?";
  const result = await db.query(sql, [name, id]);
  return result.affectedRows;
}

// mi serve per cancellare un prodotto tramite id
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
