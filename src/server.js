"use strict";

// questo file mi serve per avviare il server HTTP e separare bootstrap e configurazione app.

const app = require("./app");

// mi serve per leggere la porta da variabile ambiente o usare una fallback locale.
const port = Number(process.env.PORT) || 3000;

// mi serve per avviare il server e confermare in console dove sta ascoltando.
app.listen(port, () => {
  // lo uso per avere un log minimo utile durante sviluppo e debug.
  console.log(`Server Orizon in ascolto sulla porta ${port}`);
});
