"use strict";

// gestione degli errori 

function errorHandler(err, req, res, next) {
  let statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;

  // mappa errori MySQL 
  if (!Number.isInteger(err.statusCode)) {
    if (err.code === "ER_DUP_ENTRY") {
      statusCode = 409;
    } else if (err.code === "ER_NO_REFERENCED_ROW_2") {
      statusCode = 400;
    }
  }

  // messaggio all'utente 
  const message = statusCode === 500 ? "Errore interno del server" : (err.message || "Errore richiesta");

  // risposta JSON 
  res.status(statusCode).json({ message });
}

module.exports = errorHandler;
