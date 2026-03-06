"use strict";

// errori applicativi con status code

class HttpError extends Error {
  // errore con codice HTTP 
  constructor(statusCode, message) {
    // messaggio leggibile dell'errore
    super(message);
    // status code alla risposta API
    this.statusCode = statusCode;
  }
}

module.exports = HttpError;
