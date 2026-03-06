"use strict";

// questo file mi serve per creare errori applicativi con status code, cosi gestisco tutte le risposte errore in modo uniforme.

class HttpError extends Error {
  // mi serve per costruire un errore con codice HTTP personalizzato.
  constructor(statusCode, message) {
    // lo uso per impostare il messaggio leggibile dell'errore.
    super(message);
    // mi serve per associare lo status code alla risposta API.
    this.statusCode = statusCode;
  }
}

module.exports = HttpError;
