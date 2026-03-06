"use strict";

// questo file mi serve per gestire gli errori in modo centralizzato e non ripetere try/catch uguali ovunque.

function errorHandler(err, req, res, next) {
  // mi serve per evitare di usare status code non validi quando l'errore non lo specifica.
  const statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;

  // mi serve per dare un messaggio controllato all'utente senza esporre dettagli interni.
  const message = err.message || "Errore interno del server";

  // lo uso per restituire una risposta JSON coerente per tutti gli errori.
  res.status(statusCode).json({ message });
}

module.exports = errorHandler;
