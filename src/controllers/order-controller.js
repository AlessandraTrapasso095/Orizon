"use strict";

// gestione richieste HTTP sugli ordini 

const orderService = require("../services/order-service");
const HttpError = require("../utils/http-error");
const { validateOrderPayload, validateOrderFilters } = require("../utils/validators/order-validator");

// crea un ordine con risposta REST 201
async function createOrder(req, res, next) {
  try {
    const validation = validateOrderPayload(req.body);
    if (validation.error) {
      throw new HttpError(400, validation.error.details[0].message);
    }

    const order = await orderService.createOrder(validation.value);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

// aggiorna le associazioni di un ordine esistente
async function updateOrder(req, res, next) {
  try {
    const validation = validateOrderPayload(req.body);
    if (validation.error) {
      throw new HttpError(400, validation.error.details[0].message);
    }

    const order = await orderService.updateOrder(req.params.id, validation.value);
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
}

// cancella un ordine e risponde 204 in caso di successo
async function deleteOrder(req, res, next) {
  try {
    await orderService.removeOrder(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// mi serve per leggere tutti gli ordini con filtri opzionali su data e prodotto
async function listOrders(req, res, next) {
  try {
    const validation = validateOrderFilters(req.query);
    if (validation.error) {
      throw new HttpError(400, validation.error.details[0].message);
    }

    const orders = await orderService.listOrders(validation.value);
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  updateOrder,
  deleteOrder,
  listOrders
};
