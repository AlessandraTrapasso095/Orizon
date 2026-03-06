"use strict";

// questo file mi serve per validare i payload utente in modo centralizzato e riusabile.

const Joi = require("joi");

// mi serve per definire i campi obbligatori dell'anagrafica utente.
const userSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(100).required(),
  lastName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().max(255).required()
});

// mi serve per validare il body e impedire campi extra non previsti.
function validateUserPayload(payload) {
  return userSchema.validate(payload, {
    abortEarly: true,
    allowUnknown: false
  });
}

module.exports = {
  validateUserPayload
};
