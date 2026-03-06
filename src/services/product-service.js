"use strict";

// questo file mi serve per mettere la logica business dei prodotti separata dalle query SQL e dai controller.

const productRepository = require("../repositories/product-repository");
const HttpError = require("../utils/http-error");

// mi serve per convertire e validare l'id da URL in un numero usabile.
function parseProductId(rawId) {
  const id = Number(rawId);

  // mi serve per bloccare id non numerici o minori/uguali a zero.
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "ID prodotto non valido");
  }

  return id;
}

// mi serve per creare il prodotto e prevenire nomi duplicati.
async function createProduct(payload) {
  const existingProduct = await productRepository.findProductByName(payload.name);

  // lo uso per rispettare il vincolo di unicita in modo chiaro lato API.
  if (existingProduct) {
    throw new HttpError(409, "Esiste gia un prodotto con questo nome");
  }

  const newId = await productRepository.createProduct(payload.name);
  return productRepository.findProductById(newId);
}

// mi serve per aggiornare un prodotto esistente con controllo duplicati.
async function updateProduct(rawId, payload) {
  const id = parseProductId(rawId);

  const existingById = await productRepository.findProductById(id);
  if (!existingById) {
    throw new HttpError(404, "Prodotto non trovato");
  }

  const existingByName = await productRepository.findProductByName(payload.name);
  if (existingByName && existingByName.id !== id) {
    throw new HttpError(409, "Esiste gia un prodotto con questo nome");
  }

  await productRepository.updateProduct(id, payload.name);
  return productRepository.findProductById(id);
}

// mi serve per cancellare un prodotto e segnalare se non esiste.
async function removeProduct(rawId) {
  const id = parseProductId(rawId);
  const affectedRows = await productRepository.deleteProduct(id);

  if (affectedRows === 0) {
    throw new HttpError(404, "Prodotto non trovato");
  }
}

module.exports = {
  createProduct,
  updateProduct,
  removeProduct
};
