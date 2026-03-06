"use strict";

// questo file mi serve per gestire richieste HTTP prodotti e delegare la logica al service layer.

const productService = require("../services/product-service");
const HttpError = require("../utils/http-error");
const { validateProductPayload } = require("../utils/validators/product-validator");

// mi serve per creare un prodotto con validazione e risposta REST corretta.
async function createProduct(req, res, next) {
  try {
    const validation = validateProductPayload(req.body);
    if (validation.error) {
      throw new HttpError(400, validation.error.details[0].message);
    }

    const product = await productService.createProduct(validation.value);

    // lo uso per rispondere con 201 quando la risorsa viene creata.
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

// mi serve per aggiornare un prodotto esistente.
async function updateProduct(req, res, next) {
  try {
    const validation = validateProductPayload(req.body);
    if (validation.error) {
      throw new HttpError(400, validation.error.details[0].message);
    }

    const product = await productService.updateProduct(req.params.id, validation.value);
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
}

// mi serve per cancellare un prodotto e ritornare 204 se tutto ok.
async function deleteProduct(req, res, next) {
  try {
    await productService.removeProduct(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct
};
