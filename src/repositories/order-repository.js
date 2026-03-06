"use strict";

// questo file mi serve per gestire query ordini e relazioni con prodotti/utenti in modo centralizzato e DRY.

const db = require("../config/database");

// mi serve per creare l'ordine base e ottenere subito il nuovo id.
async function createOrder(connection) {
  const [result] = await connection.execute("INSERT INTO orders () VALUES ()");
  return result.insertId;
}

// mi serve per associare piu prodotti a un ordine con query parametrizzate.
async function addOrderProducts(connection, orderId, productIds) {
  if (productIds.length === 0) {
    return;
  }

  // mi serve per creare placeholders dinamici ma sicuri, sempre con parametri separati.
  const valuesClause = productIds.map(() => "(?, ?)").join(", ");
  const params = productIds.flatMap((productId) => [orderId, productId]);
  const sql = `INSERT INTO order_products (order_id, product_id) VALUES ${valuesClause}`;

  await connection.execute(sql, params);
}

// mi serve per associare piu utenti a un ordine con query parametrizzate.
async function addOrderUsers(connection, orderId, userIds) {
  if (userIds.length === 0) {
    return;
  }

  // lo uso per inserire tutte le associazioni in un colpo solo evitando loop con query ripetitive.
  const valuesClause = userIds.map(() => "(?, ?)").join(", ");
  const params = userIds.flatMap((userId) => [orderId, userId]);
  const sql = `INSERT INTO order_users (order_id, user_id) VALUES ${valuesClause}`;

  await connection.execute(sql, params);
}

// mi serve per cancellare tutte le righe prodotto legate a un ordine durante update ordine.
async function removeOrderProducts(connection, orderId) {
  await connection.execute("DELETE FROM order_products WHERE order_id = ?", [orderId]);
}

// mi serve per cancellare tutte le righe utente legate a un ordine durante update ordine.
async function removeOrderUsers(connection, orderId) {
  await connection.execute("DELETE FROM order_users WHERE order_id = ?", [orderId]);
}

// mi serve per aggiornare il timestamp dell'ordine quando cambio le sue associazioni.
async function touchOrder(connection, orderId) {
  await connection.execute("UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [orderId]);
}

// mi serve per trovare un ordine per id.
async function findOrderById(id) {
  const rows = await db.query("SELECT id, created_at, updated_at FROM orders WHERE id = ?", [id]);
  return rows[0] || null;
}

// mi serve per cancellare un ordine; le righe ponte vengono eliminate con ON DELETE CASCADE.
async function deleteOrder(id) {
  const result = await db.query("DELETE FROM orders WHERE id = ?", [id]);
  return result.affectedRows;
}

// mi serve per elencare ordini con filtri opzionali per data e prodotto.
async function listOrders(filters = {}) {
  const { date, productId } = filters;

  // mi serve per costruire query dinamica in modo ordinato senza duplicare varianti quasi uguali.
  let sql = `
    SELECT DISTINCT o.id, o.created_at, o.updated_at
    FROM orders o
    LEFT JOIN order_products op ON op.order_id = o.id
    WHERE 1 = 1
  `;

  const params = [];

  if (date) {
    // mi serve per filtrare per giorno ignorando l'orario del timestamp.
    sql += " AND DATE(o.created_at) = ?";
    params.push(date);
  }

  if (productId) {
    // mi serve per filtrare ordini contenenti un prodotto specifico.
    sql += " AND op.product_id = ?";
    params.push(productId);
  }

  sql += " ORDER BY o.created_at DESC";

  return db.query(sql, params);
}

// mi serve per prendere i prodotti collegati a un ordine e restituirli in risposta API.
async function listOrderProducts(orderId) {
  const sql = `
    SELECT p.id, p.name
    FROM order_products op
    INNER JOIN products p ON p.id = op.product_id
    WHERE op.order_id = ?
    ORDER BY p.id ASC
  `;

  return db.query(sql, [orderId]);
}

// mi serve per prendere gli utenti collegati a un ordine e restituirli in risposta API.
async function listOrderUsers(orderId) {
  const sql = `
    SELECT u.id, u.first_name, u.last_name, u.email
    FROM order_users ou
    INNER JOIN users u ON u.id = ou.user_id
    WHERE ou.order_id = ?
    ORDER BY u.id ASC
  `;

  return db.query(sql, [orderId]);
}

// mi serve per contare quanti prodotti tra quelli richiesti esistono davvero nel database.
async function countProductsByIds(ids) {
  if (ids.length === 0) {
    return 0;
  }

  const placeholders = ids.map(() => "?").join(", ");
  const sql = `SELECT COUNT(*) AS total FROM products WHERE id IN (${placeholders})`;
  const rows = await db.query(sql, ids);
  return rows[0].total;
}

// mi serve per contare quanti utenti tra quelli richiesti esistono davvero nel database.
async function countUsersByIds(ids) {
  if (ids.length === 0) {
    return 0;
  }

  const placeholders = ids.map(() => "?").join(", ");
  const sql = `SELECT COUNT(*) AS total FROM users WHERE id IN (${placeholders})`;
  const rows = await db.query(sql, ids);
  return rows[0].total;
}

module.exports = {
  createOrder,
  addOrderProducts,
  addOrderUsers,
  removeOrderProducts,
  removeOrderUsers,
  touchOrder,
  findOrderById,
  deleteOrder,
  listOrders,
  listOrderProducts,
  listOrderUsers,
  countProductsByIds,
  countUsersByIds
};
