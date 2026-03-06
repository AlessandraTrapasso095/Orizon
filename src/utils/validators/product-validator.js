"use strict";

// questo file mi serve per validare i payload prodotto una sola volta, cosi evito duplicazioni nei controller.

const Joi = require("joi");

// mi serve per definire la struttura valida del body prodotto.
const productSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required()
});

// mi serve per controllare i dati in ingresso e restituire un messaggio chiaro in caso di errore.
function validateProductPayload(payload) {
  return productSchema.validate(payload, {
    abortEarly: true,
    allowUnknown: false
  });
}

module.exports = {
  validateProductPayload
};
