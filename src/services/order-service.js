"use strict";

// logica business ordini (transazioni, controlli e relazioni) 

const db = require("../config/database");
const orderRepository = require("../repositories/order-repository");
const HttpError = require("../utils/http-error");

// id ordine ricevuto da URL
function parseOrderId(rawId) {
  const id = Number(rawId);

  // blocca id non validi prima di toccare il database
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "ID ordine non valido");
  }

  return id;
}

// elimina duplicati nelle liste id 
function normalizeUniqueIds(ids) {
  // lo uso per creare un elenco di interi 
  return [...new Set(ids.map((id) => Number(id)))];
}

// verifico se tutti gli id prodotto e utente esistano 
async function assertLinkedEntitiesExist(productIds, userIds) {
  const totalProducts = await orderRepository.countProductsByIds(productIds);
  if (totalProducts !== productIds.length) {
    throw new HttpError(400, "Uno o piu productIds non esistono");
  }

  const totalUsers = await orderRepository.countUsersByIds(userIds);
  if (totalUsers !== userIds.length) {
    throw new HttpError(400, "Uno o piu userIds non esistono");
  }
}

// risposta ordine completa di prodotti e utenti collegati
async function buildOrderResponse(orderId) {
  const order = await orderRepository.findOrderById(orderId);
  const products = await orderRepository.listOrderProducts(orderId);
  const users = await orderRepository.listOrderUsers(orderId);

  return {
    ...order,
    products,
    users
  };
}

// crea un ordine con tutte le associazioni 
async function createOrder(payload) {
  const productIds = normalizeUniqueIds(payload.productIds);
  const userIds = normalizeUniqueIds(payload.userIds);

  await assertLinkedEntitiesExist(productIds, userIds);

  const connection = await db.pool.getConnection();

  try {
    // vedo se inserimento ordine e associazioni vadano a buon fine 
    await connection.beginTransaction();

    const orderId = await orderRepository.createOrder(connection);
    await orderRepository.addOrderProducts(connection, orderId, productIds);
    await orderRepository.addOrderUsers(connection, orderId, userIds);

    await connection.commit();
    return buildOrderResponse(orderId);
  } catch (error) {
    // lo uso per annullare modifiche parziali in caso di errore
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// mi serve per aggiornare le associazioni ordine 
async function updateOrder(rawId, payload) {
  const orderId = parseOrderId(rawId);
  const productIds = normalizeUniqueIds(payload.productIds);
  const userIds = normalizeUniqueIds(payload.userIds);

  const existingOrder = await orderRepository.findOrderById(orderId);
  if (!existingOrder) {
    throw new HttpError(404, "Ordine non trovato");
  }

  await assertLinkedEntitiesExist(productIds, userIds);

  const connection = await db.pool.getConnection();

  try {
    // sostituisce tutte le associazioni ordine 
    await connection.beginTransaction();

    await orderRepository.removeOrderProducts(connection, orderId);
    await orderRepository.removeOrderUsers(connection, orderId);
    await orderRepository.addOrderProducts(connection, orderId, productIds);
    await orderRepository.addOrderUsers(connection, orderId, userIds);
    await orderRepository.touchOrder(connection, orderId);

    await connection.commit();
    return buildOrderResponse(orderId);
  } catch (error) {
    // ripristina lo stato precedente se qualcosa fallisce
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// cancella un ordine e restituire 404 se non esiste
async function removeOrder(rawId) {
  const orderId = parseOrderId(rawId);
  const affectedRows = await orderRepository.deleteOrder(orderId);

  if (affectedRows === 0) {
    throw new HttpError(404, "Ordine non trovato");
  }
}

// filtri query prima 
function normalizeFilters(filters) {
  const normalized = {};

  if (filters.date) {
    normalized.date = filters.date;
  }

  if (filters.productId !== undefined) {
    // mi serve per trasformare il filtro productId in numero intero
    normalized.productId = Number(filters.productId);
  }

  return normalized;
}

// mi serve per ottenere la lista ordini con dettagli
async function listOrders(filters = {}) {
  const normalizedFilters = normalizeFilters(filters);

  // per ottenere gli ordini base dal repository con i filtri richiesti
  const orders = await orderRepository.listOrders(normalizedFilters);

  // per arricchire ogni ordine con prodotti e utenti
  const enrichedOrders = await Promise.all(
    orders.map(async (order) => {
      const products = await orderRepository.listOrderProducts(order.id);
      const users = await orderRepository.listOrderUsers(order.id);

      return {
        ...order,
        products,
        users
      };
    })
  );

  return enrichedOrders;
}

module.exports = {
  createOrder,
  updateOrder,
  removeOrder,
  listOrders
};
