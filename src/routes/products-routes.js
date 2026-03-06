"use strict";

// questo file mi serve per definire tutte le rotte REST dei prodotti in un router dedicato.

const express = require("express");
const productController = require("../controllers/product-controller");

const router = express.Router();

// mi serve per creare un prodotto.
router.post("/", productController.createProduct);

// mi serve per aggiornare un prodotto tramite id.
router.put("/:id", productController.updateProduct);

// mi serve per cancellare un prodotto tramite id.
router.delete("/:id", productController.deleteProduct);

module.exports = router;
