"use strict";

// serve per testare la logica business dei prodotti 

const assert = require("node:assert/strict");
const sinon = require("sinon");

const productService = require("../../src/services/product-service");
const productRepository = require("../../src/repositories/product-repository");

// crea un contesto di test chiaro per il service prodotti
describe("product-service", () => {
  // mi gestisco tutti gli stub
  const sandbox = sinon.createSandbox();

  // evito che uno stub di un test influenzi gli altri test
  afterEach(() => {
    sandbox.restore();
  });

  // verifico la creazione prodotto quando non ci sono duplicati
  it("createProduct: crea prodotto e ritorna la risorsa", async () => {
    // serve per simulare il controllo duplicato e l'inserimento DB
    sandbox.stub(productRepository, "findProductByName").resolves(null);
    sandbox.stub(productRepository, "createProduct").resolves(10);
    sandbox.stub(productRepository, "findProductById").resolves({ id: 10, name: "Trekking Nepal" });

    // lo uso per eseguire la funzione reale del service
    const result = await productService.createProduct({ name: "Trekking Nepal" });

    // mi controlla che il risultato finale sia quello atteso
    assert.deepEqual(result, { id: 10, name: "Trekking Nepal" });
  });

  // serve per verificare il conflitto 409 quando il nome esiste gia
  it("createProduct: lancia errore 409 se nome duplicato", async () => {
    // simula un prodotto gia presente
    sandbox.stub(productRepository, "findProductByName").resolves({ id: 1, name: "Safari" });

    // lo uso per verificare l'errore
    await assert.rejects(
      () => productService.createProduct({ name: "Safari" }),
      (error) => {
        // status code e messaggio restituiti
        assert.equal(error.statusCode, 409);
        assert.equal(error.message, "Esiste gia un prodotto con questo nome");
        return true;
      }
    );
  });

  // mi serve per testare la validazione dell'id in cancellazione prodotto
  it("removeProduct: lancia errore 400 se id non valido", async () => {
    // verifico che un id non numerico venga bloccato subito
    await assert.rejects(
      () => productService.removeProduct("abc"),
      (error) => {
        // mi conferma che l'errore sia quello previsto
        assert.equal(error.statusCode, 400);
        assert.equal(error.message, "ID prodotto non valido");
        return true;
      }
    );
  });
});
