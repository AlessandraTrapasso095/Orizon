"use strict";

// questo file mi serve per definire le rotte REST degli ordini mantenendo separata la responsabilita dal router principale.

const express = require("express");
const orderController = require("../controllers/order-controller");

const router = express.Router();

// mi serve per visualizzare tutti gli ordini e applicare eventuali filtri query.
router.get("/", orderController.listOrders);

// mi serve per creare un ordine.
router.post("/", orderController.createOrder);

// mi serve per aggiornare un ordine tramite id.
router.put("/:id", orderController.updateOrder);

// mi serve per cancellare un ordine tramite id.
router.delete("/:id", orderController.deleteOrder);

module.exports = router;
