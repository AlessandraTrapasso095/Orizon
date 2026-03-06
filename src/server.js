"use strict";

// avvia il server HTTP e separa bootstrap e configurazione app

const app = require("./app");

// legge porta da variabile ambiente o usar una fallback locale
const port = Number(process.env.PORT) || 3000;

// avvia il server e conferma in console dove sta ascoltando
app.listen(port, () => {
  // lo uso per avere un log minimo utile durante sviluppo e debug
  console.log(`Server Orizon in ascolto sulla porta ${port}`);
});
