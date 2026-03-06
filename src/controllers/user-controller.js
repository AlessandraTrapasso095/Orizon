"use strict";

// questo file mi serve per ricevere richieste HTTP utenti e applicare validazione + service logic.

const userService = require("../services/user-service");
const HttpError = require("../utils/http-error");
const { validateUserPayload } = require("../utils/validators/user-validator");

// mi serve per creare un utente rispettando i vincoli del dominio.
async function createUser(req, res, next) {
  try {
    const validation = validateUserPayload(req.body);
    if (validation.error) {
      throw new HttpError(400, validation.error.details[0].message);
    }

    const user = await userService.createUser(validation.value);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

// mi serve per aggiornare l'anagrafica utente.
async function updateUser(req, res, next) {
  try {
    const validation = validateUserPayload(req.body);
    if (validation.error) {
      throw new HttpError(400, validation.error.details[0].message);
    }

    const user = await userService.updateUser(req.params.id, validation.value);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

// mi serve per eliminare un utente restituendo 204 in caso di successo.
async function deleteUser(req, res, next) {
  try {
    await userService.removeUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createUser,
  updateUser,
  deleteUser
};
