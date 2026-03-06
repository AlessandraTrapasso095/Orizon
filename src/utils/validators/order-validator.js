"use strict";

// questo file mi serve per validare il payload ordini in un punto unico e riusabile.

const Joi = require("joi");

// mi serve per definire un id valido nelle liste prodotto/utente.
const idSchema = Joi.number().integer().positive().required();

// mi serve per imporre almeno un prodotto e almeno un utente senza campi extra.
const orderSchema = Joi.object({
  productIds: Joi.array().items(idSchema).min(1).required(),
  userIds: Joi.array().items(idSchema).min(1).required()
});

// mi serve per validare i filtri query degli ordini senza accettare campi non previsti.
const orderFiltersSchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  productId: idSchema
});

// mi serve per controllare il body richiesta e fornire errori coerenti.
function validateOrderPayload(payload) {
  return orderSchema.validate(payload, {
    abortEarly: true,
    allowUnknown: false
  });
}

// mi serve per validare i query params usati nei filtri ordini.
function validateOrderFilters(query) {
  return orderFiltersSchema.validate(query, {
    abortEarly: true,
    allowUnknown: false
  });
}

module.exports = {
  validateOrderPayload,
  validateOrderFilters
};
