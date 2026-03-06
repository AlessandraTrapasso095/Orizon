"use strict";

// questo file mi serve per gestire la logica business utenti separando responsabilita tra controller e repository.

const userRepository = require("../repositories/user-repository");
const HttpError = require("../utils/http-error");

// mi serve per validare l'id utente letto dai parametri rotta.
function parseUserId(rawId) {
  const id = Number(rawId);

  // mi serve per bloccare input non valido prima di interrogare il database.
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "ID utente non valido");
  }

  return id;
}

// mi serve per creare un utente evitando email duplicate.
async function createUser(payload) {
  const existingUser = await userRepository.findUserByEmail(payload.email);

  // lo uso per restituire un conflitto se l'email e gia registrata.
  if (existingUser) {
    throw new HttpError(409, "Esiste gia un utente con questa email");
  }

  const newId = await userRepository.createUser(payload.firstName, payload.lastName, payload.email);
  return userRepository.findUserById(newId);
}

// mi serve per aggiornare i dati utente mantenendo unicita email.
async function updateUser(rawId, payload) {
  const id = parseUserId(rawId);

  const existingById = await userRepository.findUserById(id);
  if (!existingById) {
    throw new HttpError(404, "Utente non trovato");
  }

  const existingByEmail = await userRepository.findUserByEmail(payload.email);
  if (existingByEmail && existingByEmail.id !== id) {
    throw new HttpError(409, "Esiste gia un utente con questa email");
  }

  await userRepository.updateUser(id, payload.firstName, payload.lastName, payload.email);
  return userRepository.findUserById(id);
}

// mi serve per eliminare un utente e segnalare se l'id non esiste.
async function removeUser(rawId) {
  const id = parseUserId(rawId);
  const affectedRows = await userRepository.deleteUser(id);

  if (affectedRows === 0) {
    throw new HttpError(404, "Utente non trovato");
  }
}

module.exports = {
  createUser,
  updateUser,
  removeUser
};
