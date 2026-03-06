<!-- modello dati del progetto -->

# Modello dati Orizon (Step 5)

## Entita principali

1. `products`
- `id` (PK)
- `name` (obbligatorio, univoco)
- `created_at`
- `updated_at`

2. `users`
- `id` (PK)
- `first_name` (obbligatorio)
- `last_name` (obbligatorio)
- `email` (obbligatorio, univoco)
- `created_at`
- `updated_at`

3. `orders`
- `id` (PK)
- `created_at` (data inserimento ordine, usata per filtro)
- `updated_at`

## Relazioni

1. Un ordine contiene piu prodotti, e un prodotto puo stare in piu ordini.
- Relazione molti-a-molti con tabella ponte `order_products`.

2. Un ordine puo avere piu utenti associati, e un utente puo comparire in piu ordini.
- Relazione molti-a-molti con tabella ponte `order_users`.

## Tabelle ponte

1. `order_products`
- `order_id` (FK -> orders.id)
- `product_id` (FK -> products.id)
- PK composta (`order_id`, `product_id`)

2. `order_users`
- `order_id` (FK -> orders.id)
- `user_id` (FK -> users.id)
- PK composta (`order_id`, `user_id`)

## Regole di business minime

1. Non creo ordini vuoti.
- Ogni ordine deve avere almeno 1 prodotto e almeno 1 utente.

2. Nessun duplicato nelle associazioni.
- Nello stesso ordine non ripeto lo stesso prodotto o lo stesso utente.

3. Integrita referenziale.
- Non posso associare all'ordine ID di prodotto o utente inesistenti.

4. Validazione base dati.
- `name` prodotto non vuoto.
- `first_name`, `last_name` non vuoti.
- `email` in formato valido.

## Endpoint target (vista dominio)

1. Prodotti
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

2. Utenti
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

3. Ordini
- `POST /api/orders`
- `PUT /api/orders/:id`
- `DELETE /api/orders/:id`
- `GET /api/orders`
- `GET /api/orders?date=YYYY-MM-DD`
- `GET /api/orders?productId=<id>`

## Formato payload ordini (bozza)

```json
{
  "productIds": [1, 2],
  "userIds": [3, 4]
}
```

## Note DRY da applicare nei prossimi step

1. Validatori riusabili (`src/utils/validators`).
2. Gestione errori uniforme in middleware unico.
3. Query comuni centralizzate nei repository.
