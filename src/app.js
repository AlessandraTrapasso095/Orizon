"use strict";

// questo file mi serve per creare e configurare l'app Express una volta sola, cosi poi la riuso senza duplicare logica.

const express = require("express");
const apiRouter = require("./routes");
const errorHandler = require("./middlewares/error-handler");

const app = express();

// mi serve per leggere i body JSON nelle richieste POST/PUT/PATCH.
app.use(express.json());

// mi serve per montare tutte le rotte API in un punto unico e mantenere il codice DRY.
app.use("/api", apiRouter);

// mi serve per gestire richieste a percorsi inesistenti con uno status code corretto.
app.use((req, res) => {
  // lo uso per rispondere sempre in JSON in modo coerente.
  res.status(404).json({
    message: "Risorsa non trovata"
  });
});

// mi serve per centralizzare la gestione degli errori dell'app.
app.use(errorHandler);

module.exports = app;
