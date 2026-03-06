"use strict";

// questo file mi serve per testare la logica business utenti (duplicati email, update e delete) senza dipendenze esterne reali.

const assert = require("node:assert/strict");
const sinon = require("sinon");

const userService = require("../../src/services/user-service");
const userRepository = require("../../src/repositories/user-repository");

// mi serve per raggruppare i test del service utenti.
describe("user-service", () => {
  // mi serve per creare un sandbox sinon condiviso tra i test.
  const sandbox = sinon.createSandbox();

  // mi serve per ripristinare l'ambiente pulito dopo ogni test.
  afterEach(() => {
    sandbox.restore();
  });

  // mi serve per verificare la creazione utente quando l'email e disponibile.
  it("createUser: crea utente e ritorna la risorsa", async () => {
    // mi serve per simulare repository senza accesso al DB reale.
    sandbox.stub(userRepository, "findUserByEmail").resolves(null);
    sandbox.stub(userRepository, "createUser").resolves(5);
    sandbox.stub(userRepository, "findUserById").resolves({
      id: 5,
      first_name: "Luca",
      last_name: "Bianchi",
      email: "luca@example.com"
    });

    // lo uso per invocare il metodo business reale.
    const result = await userService.createUser({
      firstName: "Luca",
      lastName: "Bianchi",
      email: "luca@example.com"
    });

    // mi serve per confrontare il payload atteso.
    assert.equal(result.id, 5);
    assert.equal(result.email, "luca@example.com");
  });

  // mi serve per verificare il conflitto email gia esistente.
  it("createUser: lancia errore 409 se email duplicata", async () => {
    // mi serve per simulare presenza utente con stessa email.
    sandbox.stub(userRepository, "findUserByEmail").resolves({ id: 99, email: "x@example.com" });

    // lo uso per verificare lo status code di dominio.
    await assert.rejects(
      () => userService.createUser({ firstName: "A", lastName: "B", email: "x@example.com" }),
      (error) => {
        // mi serve per controllare coerenza dell'errore.
        assert.equal(error.statusCode, 409);
        assert.equal(error.message, "Esiste gia un utente con questa email");
        return true;
      }
    );
  });

  // mi serve per verificare la risposta 404 quando aggiorno un utente inesistente.
  it("updateUser: lancia errore 404 se utente non trovato", async () => {
    // mi serve per simulare assenza dell'utente richiesto.
    sandbox.stub(userRepository, "findUserById").resolves(null);

    // lo uso per verificare errore previsto dal dominio.
    await assert.rejects(
      () => userService.updateUser(123, {
        firstName: "Mario",
        lastName: "Rossi",
        email: "mario@example.com"
      }),
      (error) => {
        // mi serve per controllare codice e messaggio.
        assert.equal(error.statusCode, 404);
        assert.equal(error.message, "Utente non trovato");
        return true;
      }
    );
  });
});
