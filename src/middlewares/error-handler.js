"use strict";

// questo file mi serve per gestire gli errori in modo centralizzato e non ripetere try/catch uguali ovunque.

function errorHandler(err, req, res, next) {
  let statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;

  // mi serve per mappare errori MySQL comuni in status code coerenti lato API.
  if (!Number.isInteger(err.statusCode)) {
    if (err.code === "ER_DUP_ENTRY") {
      statusCode = 409;
    } else if (err.code === "ER_NO_REFERENCED_ROW_2") {
      statusCode = 400;
    }
  }

  // mi serve per dare un messaggio controllato all'utente senza esporre dettagli interni.
  const message = statusCode === 500 ? "Errore interno del server" : (err.message || "Errore richiesta");

  // lo uso per restituire una risposta JSON coerente per tutti gli errori.
  res.status(statusCode).json({ message });
}

module.exports = errorHandler;
