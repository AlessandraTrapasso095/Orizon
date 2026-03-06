"use strict";

// payload ordini 

const Joi = require("joi");

// id valido nelle liste prodotto/utente
const idSchema = Joi.number().integer().positive().required();

// almeno un prodotto e almeno un utente 
const orderSchema = Joi.object({
  productIds: Joi.array().items(idSchema).min(1).required(),
  userIds: Joi.array().items(idSchema).min(1).required()
});

// filtri query degli ordini 
const orderFiltersSchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  productId: idSchema
});

// body richiesta e errori 
function validateOrderPayload(payload) {
  return orderSchema.validate(payload, {
    abortEarly: true,
    allowUnknown: false
  });
}

// query params 
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
