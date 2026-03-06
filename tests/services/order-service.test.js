"use strict";

// logica ordini (filtri, errori dominio e flusso transazione)

const assert = require("node:assert/strict");
const sinon = require("sinon");

const orderService = require("../../src/services/order-service");
const orderRepository = require("../../src/repositories/order-repository");
const db = require("../../src/config/database");

// test del service ordini
describe("order-service", () => {
  // mi serve per gestire tutti gli stub 
  const sandbox = sinon.createSandbox();

  // pulizia stub e side effects ad ogni test
  afterEach(() => {
    sandbox.restore();
  });

  // verifica list ordini 
  it("listOrders: ritorna ordini arricchiti con prodotti e utenti", async () => {
    // mi serve per simulare ordine 
    sandbox.stub(orderRepository, "listOrders").resolves([
      { id: 7, created_at: "2026-03-06T10:00:00.000Z", updated_at: "2026-03-06T10:00:00.000Z" }
    ]);
    sandbox.stub(orderRepository, "listOrderProducts").resolves([{ id: 1, name: "Safari" }]);
    sandbox.stub(orderRepository, "listOrderUsers").resolves([{ id: 2, first_name: "Anna", last_name: "Verdi" }]);

    // chiamo il metodo con query string simulata
    const result = await orderService.listOrders({ productId: "1", date: "2026-03-06" });

    // controllo che il repository abbia ricevuto productId numerico
    sinon.assert.calledWithExactly(orderRepository.listOrders, { productId: 1, date: "2026-03-06" });

    // verifico che la risposta finale includa relazioni annidate
    assert.equal(result.length, 1);
    assert.equal(result[0].products[0].name, "Safari");
    assert.equal(result[0].users[0].id, 2);
  });

  // verifico il blocco create ordine quando productIds non esistono tutti
  it("createOrder: lancia errore 400 se productIds inesistenti", async () => {
    sandbox.stub(orderRepository, "countProductsByIds").resolves(1);

    // lo uso per eseguire la create e verificare errore dominio
    await assert.rejects(
      () => orderService.createOrder({ productIds: [1, 2], userIds: [3] }),
      (error) => {
        // mi serve per confermare errore corretto lato API
        assert.equal(error.statusCode, 400);
        assert.equal(error.message, "Uno o piu productIds non esistono");
        return true;
      }
    );
  });

  // verifico il percorso felice create ordine
  it("createOrder: crea ordine in transazione e ritorna ordine arricchito", async () => {
    const fakeConnection = {
      beginTransaction: sandbox.stub().resolves(),
      commit: sandbox.stub().resolves(),
      rollback: sandbox.stub().resolves(),
      release: sandbox.stub(),
      execute: sandbox.stub().resolves([{ insertId: 50 }])
    };

    // sostituisce la connessione reale del pool durante il test
    sandbox.stub(db.pool, "getConnection").resolves(fakeConnection);
    sandbox.stub(orderRepository, "countProductsByIds").resolves(2);
    sandbox.stub(orderRepository, "countUsersByIds").resolves(1);
    sandbox.stub(orderRepository, "createOrder").resolves(50);
    sandbox.stub(orderRepository, "addOrderProducts").resolves();
    sandbox.stub(orderRepository, "addOrderUsers").resolves();
    sandbox.stub(orderRepository, "findOrderById").resolves({ id: 50, created_at: "x", updated_at: "x" });
    sandbox.stub(orderRepository, "listOrderProducts").resolves([{ id: 1, name: "Safari" }]);
    sandbox.stub(orderRepository, "listOrderUsers").resolves([{ id: 3, first_name: "Luca" }]);

    // lo uso per avviare il flusso completo di create ordine
    const result = await orderService.createOrder({ productIds: [1, 2], userIds: [3] });

    // mi serve per verificare chiamate principali della transazione
    sinon.assert.calledOnce(fakeConnection.beginTransaction);
    sinon.assert.calledOnce(fakeConnection.commit);
    sinon.assert.calledOnce(fakeConnection.release);

    // mi serve per confermare la forma base della risposta finale
    assert.equal(result.id, 50);
    assert.equal(result.products.length, 1);
    assert.equal(result.users.length, 1);
  });
});
