# Orizon API 

Backend RESTful per la gestione di prodotti, utenti e ordini con filtri sugli ordini per data e prodotto.

## Stack tecnico

- Node.js
- Express
- MySQL
- Joi (validazione)
- Mocha + Sinon + Supertest (test)

## Requisiti locali

- Node.js installato
- MySQL installato e in esecuzione

Versioni usate in sviluppo:
- Node: `v24.13.0`
- npm: `11.6.2`
- MySQL client: `9.6.0`

## Setup progetto

1. Installa dipendenze

```bash
npm install
```

2. Crea file `.env` partendo dall'esempio

```bash
cp .env.example .env
```

3. Configura credenziali DB nel file `.env`

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=orizon
DB_CONNECTION_LIMIT=10
```

4. Crea database e tabelle

```bash
mysql -u root -p < database/migrations.sql
```

## Avvio applicazione

Avvio sviluppo (con reload):

```bash
npm run dev
```

Avvio standard:

```bash
npm start
```

Health check:

```bash
GET /api/health
```

## Test automatici

Esegui tutti i test:

```bash
npm test
```

Contenuto test:
- Unit test su `services` (logica business)
- Integration test API su route/controller/validator

## Endpoints REST

### Products

- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

Body esempio create/update:

```json
{
  "name": "Safari Tanzania"
}
```

### Users

- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

Body esempio create/update:

```json
{
  "firstName": "Luca",
  "lastName": "Bianchi",
  "email": "luca@example.com"
}
```

### Orders

- `POST /api/orders`
- `PUT /api/orders/:id`
- `DELETE /api/orders/:id`
- `GET /api/orders`
- `GET /api/orders?date=YYYY-MM-DD`
- `GET /api/orders?productId=1`
- `GET /api/orders?date=YYYY-MM-DD&productId=1`

Body esempio create/update:

```json
{
  "productIds": [1, 2],
  "userIds": [3, 4]
}
```

## Status code principali

- `200` OK
- `201` Created
- `204` No Content
- `400` Bad Request
- `404` Not Found
- `409` Conflict
- `500` Internal Server Error

## Note architetturali (DRY)

- Separazione livelli: `routes -> controllers -> services -> repositories`
- Validazioni centralizzate in `src/utils/validators`
- Gestione errori centralizzata in `src/middlewares/error-handler.js`
- Query SQL parametrizzate con `mysql2/promise` (prepared statements)

## Struttura progetto

```text
src/
  config/
  controllers/
  middlewares/
  repositories/
  routes/
  services/
  utils/
database/
  migrations.sql
tests/
  api/
  services/
```

## Github
- GitHub Repository: `https://github.com/AlessandraTrapasso095/Orizon.git`

## Autrice: Alessandra Trapasso 👩