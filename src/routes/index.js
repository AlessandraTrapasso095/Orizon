"use strict";

// questo file mi serve per raccogliere tutte le rotte in un solo router, cosi evito ripetizioni nei file principali.

const express = require("express");
const productsRouter = require("./products-routes");
const usersRouter = require("./users-routes");
const ordersRouter = require("./orders-routes");

const router = express.Router();

// mi serve per avere un endpoint semplice di controllo stato API.
router.get("/health", (req, res) => {
  // lo uso per confermare che il server risponde correttamente.
  res.status(200).json({
    message: "API Orizon attiva"
  });
});

// mi serve per montare tutte le rotte prodotto sotto /api/products.
router.use("/products", productsRouter);

// mi serve per montare tutte le rotte utente sotto /api/users.
router.use("/users", usersRouter);

// mi serve per montare tutte le rotte ordine sotto /api/orders.
router.use("/orders", ordersRouter);

module.exports = router;
