"use strict";

// logica business dei prodotti 

const productRepository = require("../repositories/product-repository");
const HttpError = require("../utils/http-error");

// valida l'id da URL in un numero 
function parseProductId(rawId) {
  const id = Number(rawId);

  // mi serve per bloccare id non numerici o <=0
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "ID prodotto non valido");
  }

  return id;
}

// mi serve per creare il prodotto e prevenire nomi duplicati
async function createProduct(payload) {
  const existingProduct = await productRepository.findProductByName(payload.name);

  if (existingProduct) {
    throw new HttpError(409, "Esiste gia un prodotto con questo nome");
  }

  const newId = await productRepository.createProduct(payload.name);
  return productRepository.findProductById(newId);
}

// aggiorna un prodotto esistente
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

// mi serve per cancellare un prodotto e segnalare se non esiste
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
