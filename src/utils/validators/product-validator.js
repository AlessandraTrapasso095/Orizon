"use strict";

// payload prodotto

const Joi = require("joi");

// struttura valida del body prodotto
const productSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required()
});

// dati in ingresso e messaggio in caso di errore
function validateProductPayload(payload) {
  return productSchema.validate(payload, {
    abortEarly: true,
    allowUnknown: false
  });
}

module.exports = {
  validateProductPayload
};
