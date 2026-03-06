"use strict";

// raccoglie tutte le rotte in un solo router

const express = require("express");
const productsRouter = require("./products-routes");
const usersRouter = require("./users-routes");
const ordersRouter = require("./orders-routes");

const router = express.Router();

// endpoint di controllo stato API
router.get("/health", (req, res) => {
  // lo uso per confermare che il server risponde correttamente
  res.status(200).json({
    message: "API Orizon attiva"
  });
});

// mi serve per montare tutte le rotte prodotto sotto /api/products
router.use("/products", productsRouter);

// mi serve per montare tutte le rotte utente sotto /api/users
router.use("/users", usersRouter);

// mi serve per montare tutte le rotte ordine sotto /api/orders
router.use("/orders", ordersRouter);

module.exports = router;
