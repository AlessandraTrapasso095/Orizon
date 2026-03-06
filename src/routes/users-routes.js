"use strict";

// questo file mi serve per separare le rotte utenti e mantenere il codice organizzato e DRY.

const express = require("express");
const userController = require("../controllers/user-controller");

const router = express.Router();

// mi serve per creare un utente.
router.post("/", userController.createUser);

// mi serve per aggiornare un utente tramite id.
router.put("/:id", userController.updateUser);

// mi serve per cancellare un utente tramite id.
router.delete("/:id", userController.deleteUser);

module.exports = router;
