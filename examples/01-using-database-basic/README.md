# Using Database Basic

This example demonstrates a basic AppCore workflow interacting directly with the database through a connector.

It uses the shared `minimal_app.item` table to demonstrate how to initialize a simple application and perform basic insert and read operations without generating models, using both explicit and implicit schemas.

Even in this simplified setup, the database layer already supports:

- multiple database registrations
- multiple schemas
- connection management
- complex transaction handling

This architecture scales from introductory scripts to advanced applications requiring several databases, schema separation, controlled connector usage, and transactional operations.

## Prerequisites

- Node.js and npm
- Docker

## Database

From the `examples/` directory, start the shared PostgreSQL container:

```bash
docker compose up -d
```

Then initialize or reset the database for this example:

```bash
docker compose exec postgres psql -U appcore -d appcore -f /examples/01-using-database-basic/init.sql
```

## Install dependencies

From this example directory:

```bash
npm install
```

## Initialize the example

Generate the basic application structure without model generation:

```bash
npm run init
```

This command runs:

```bash
app-core
```

This creates the minimal project skeleton required for the connector usage showcased in this example.

#### Usage example:

`index.js`
```js
import { DbManager } from './app/db/DbManager.js';

DbManager.addDatabase(
{
    host: 'localhost',
    port: 5432,
    user: 'appcore',
    password: 'appcore',
    database: 'appcore'
});

const connector = DbManager.getConnector('appcore');
await connector.query('SELECT * FROM minimal_app.item');
let row = await connector.next();
while (row)
{
    Log.info(row);
    row = await connector.next();
}
```

See [`index.js`](./index.js) for the full code.

## Run the example

```bash
npm run start
```

or

```bash
node index.js
```

## Notes

- This example is intentionally minimalistic.
- It relies on the shared PostgreSQL service defined in `examples/compose.yaml`.
- The database schema for this example contains a single `item` table.
- The same database layer is designed to support multi-database and multi-schema applications.
- Connector usage, connection management, and transactions are handled through the framework database layer.
