"use strict";

// questo file mi serve per testare l'integrazione tra route, controller, validazione e middleware HTTP senza usare un database reale.

const assert = require("node:assert/strict");
const sinon = require("sinon");
const request = require("supertest");

const app = require("../../src/app");
const productService = require("../../src/services/product-service");
const userService = require("../../src/services/user-service");
const orderService = require("../../src/services/order-service");

// mi serve per creare una suite integration con comportamento API realistico.
describe("api integration", () => {
  // mi serve per gestire tutti gli stub in un contenitore unico e pulito.
  const sandbox = sinon.createSandbox();

  // mi serve per creare un server vero su porta random per ogni test.
  let server;

  // mi serve per aprire il server prima di ogni test in isolamento.
  beforeEach((done) => {
    server = app.listen(0, done);
  });

  // mi serve per chiudere server e ripristinare stub dopo ogni test.
  afterEach((done) => {
    sandbox.restore();
    server.close(done);
  });

  // mi serve per verificare endpoint base di health check.
  it("GET /api/health -> 200", async () => {
    // lo uso per chiamare la rotta reale dell'app.
    const response = await request(server).get("/api/health");

    // mi serve per controllare status e body di risposta.
    assert.equal(response.status, 200);
    assert.equal(response.body.message, "API Orizon attiva");
  });

  // mi serve per verificare validazione body prodotto non valido.
  it("POST /api/products -> 400 se payload non valido", async () => {
    // lo uso per inviare body mancante e attivare Joi.
    const response = await request(server).post("/api/products").send({});

    // mi serve per verificare errore client expected.
    assert.equal(response.status, 400);
    assert.equal(typeof response.body.message, "string");
  });

  // mi serve per verificare creazione prodotto con risposta 201.
  it("POST /api/products -> 201 se ok", async () => {
    // mi serve per simulare service senza DB reale.
    sandbox.stub(productService, "createProduct").resolves({ id: 1, name: "Safari" });

    // lo uso per testare flusso route+controller completo.
    const response = await request(server).post("/api/products").send({ name: "Safari" });

    // mi serve per verificare status code e payload output.
    assert.equal(response.status, 201);
    assert.deepEqual(response.body, { id: 1, name: "Safari" });
  });

  // mi serve per verificare mapping errore dominio su endpoint utenti.
  it("POST /api/users -> 409 su email duplicata", async () => {
    // mi serve per creare errore applicativo simulato nel service.
    const duplicatedEmailError = new Error("Esiste gia un utente con questa email");
    duplicatedEmailError.statusCode = 409;
    sandbox.stub(userService, "createUser").rejects(duplicatedEmailError);

    // lo uso per testare la propagazione errore fino al middleware centrale.
    const response = await request(server).post("/api/users").send({
      firstName: "Mario",
      lastName: "Rossi",
      email: "mario@example.com"
    });

    // mi serve per controllare risposta HTTP coerente.
    assert.equal(response.status, 409);
    assert.equal(response.body.message, "Esiste gia un utente con questa email");
  });

  // mi serve per verificare validazione query su ordini con productId non valido.
  it("GET /api/orders -> 400 se productId non valido", async () => {
    // lo uso per inviare query non numerica e attivare validator.
    const response = await request(server).get("/api/orders").query({ productId: "abc" });

    // mi serve per verificare la risposta d'errore lato API.
    assert.equal(response.status, 400);
    assert.equal(typeof response.body.message, "string");
  });

  // mi serve per verificare filtro ordini corretto e payload arricchito.
  it("GET /api/orders -> 200 con lista ordini filtrati", async () => {
    // mi serve per simulare la risposta del service ordini.
    sandbox.stub(orderService, "listOrders").resolves([
      {
        id: 33,
        created_at: "2026-03-06T10:00:00.000Z",
        updated_at: "2026-03-06T10:00:00.000Z",
        products: [{ id: 1, name: "Safari" }],
        users: [{ id: 4, first_name: "Anna", last_name: "Verdi", email: "anna@example.com" }]
      }
    ]);

    // lo uso per chiamare endpoint con filtri richiesti dalla traccia.
    const response = await request(server)
      .get("/api/orders")
      .query({ date: "2026-03-06", productId: 1 });

    // mi serve per verificare status e struttura dati.
    assert.equal(response.status, 200);
    assert.equal(Array.isArray(response.body), true);
    assert.equal(response.body[0].id, 33);
    assert.equal(response.body[0].products[0].name, "Safari");
  });
});
