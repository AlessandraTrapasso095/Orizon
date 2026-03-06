"use strict";

// configura l'app Express

const express = require("express");
const apiRouter = require("./routes");
const errorHandler = require("./middlewares/error-handler");

const app = express();

// mi serve per leggere i body JSON nelle richieste POST/PUT/PATCH
app.use(express.json());

// monta tutte le rotte API 
app.use("/api", apiRouter);

// gestisce richieste a percorsi inesistenti 
app.use((req, res) => {
  res.status(404).json({
    message: "Risorsa non trovata"
  });
});

// gestione degli errori dell'app
app.use(errorHandler);

module.exports = app;
