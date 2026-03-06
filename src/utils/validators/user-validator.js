"use strict";

// payload utente

const Joi = require("joi");

// campi obbligatori dell'anagrafica utente
const userSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(100).required(),
  lastName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().max(255).required()
});

// valida il body e impedisce campi extra non previsti
function validateUserPayload(payload) {
  return userSchema.validate(payload, {
    abortEarly: true,
    allowUnknown: false
  });
}

module.exports = {
  validateUserPayload
};
