"use strict";

// richieste HTTP utenti e validazione + service logic

const userService = require("../services/user-service");
const HttpError = require("../utils/http-error");
const { validateUserPayload } = require("../utils/validators/user-validator");

// crea un utente 
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

// aggiorna l'anagrafica utente
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

// elimina un utente restituendo 204 in caso di successo
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
