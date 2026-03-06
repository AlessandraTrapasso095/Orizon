"use strict";

// questo file mi serve per orchestrare la logica business ordini (transazioni, controlli e relazioni) senza duplicazioni nei controller.

const db = require("../config/database");
const orderRepository = require("../repositories/order-repository");
const HttpError = require("../utils/http-error");

// mi serve per validare l'id ordine ricevuto da URL.
function parseOrderId(rawId) {
  const id = Number(rawId);

  // mi serve per bloccare id non validi prima di toccare il database.
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "ID ordine non valido");
  }

  return id;
}

// mi serve per eliminare duplicati nelle liste id e mantenere un formato coerente.
function normalizeUniqueIds(ids) {
  // lo uso per creare un elenco di interi unici in ordine di inserimento.
  return [...new Set(ids.map((id) => Number(id)))];
}

// mi serve per verificare che tutti gli id prodotto e utente esistano davvero.
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

// mi serve per comporre una risposta ordine completa di prodotti e utenti collegati.
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

// mi serve per creare un ordine con tutte le associazioni in transazione atomica.
async function createOrder(payload) {
  const productIds = normalizeUniqueIds(payload.productIds);
  const userIds = normalizeUniqueIds(payload.userIds);

  await assertLinkedEntitiesExist(productIds, userIds);

  const connection = await db.pool.getConnection();

  try {
    // mi serve per garantire che inserimento ordine e associazioni vadano a buon fine insieme.
    await connection.beginTransaction();

    const orderId = await orderRepository.createOrder(connection);
    await orderRepository.addOrderProducts(connection, orderId, productIds);
    await orderRepository.addOrderUsers(connection, orderId, userIds);

    await connection.commit();
    return buildOrderResponse(orderId);
  } catch (error) {
    // lo uso per annullare modifiche parziali in caso di errore.
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// mi serve per aggiornare le associazioni ordine in una singola transazione.
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
    // mi serve per sostituire tutte le associazioni ordine senza lasciare stato intermedio incoerente.
    await connection.beginTransaction();

    await orderRepository.removeOrderProducts(connection, orderId);
    await orderRepository.removeOrderUsers(connection, orderId);
    await orderRepository.addOrderProducts(connection, orderId, productIds);
    await orderRepository.addOrderUsers(connection, orderId, userIds);
    await orderRepository.touchOrder(connection, orderId);

    await connection.commit();
    return buildOrderResponse(orderId);
  } catch (error) {
    // mi serve per ripristinare lo stato precedente se qualcosa fallisce.
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// mi serve per cancellare un ordine e restituire 404 se non esiste.
async function removeOrder(rawId) {
  const orderId = parseOrderId(rawId);
  const affectedRows = await orderRepository.deleteOrder(orderId);

  if (affectedRows === 0) {
    throw new HttpError(404, "Ordine non trovato");
  }
}

// mi serve per normalizzare e validare i filtri query prima di passarli al repository.
function normalizeFilters(filters) {
  const normalized = {};

  if (filters.date) {
    normalized.date = filters.date;
  }

  if (filters.productId !== undefined) {
    // mi serve per trasformare il filtro productId in numero intero.
    normalized.productId = Number(filters.productId);
  }

  return normalized;
}

// mi serve per ottenere la lista ordini con dettagli completi e filtri opzionali.
async function listOrders(filters = {}) {
  const normalizedFilters = normalizeFilters(filters);

  // mi serve per ottenere gli ordini base dal repository con i filtri richiesti.
  const orders = await orderRepository.listOrders(normalizedFilters);

  // mi serve per arricchire ogni ordine con prodotti e utenti in parallelo.
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
