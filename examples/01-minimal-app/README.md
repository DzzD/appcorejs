# Minimal App

This example demonstrates the smallest practical AppCore setup with a PostgreSQL database.

It uses a simple `item` table and shows how to initialize a minimal application structure without generating model classes.

Even in this minimal setup, the database layer already supports:

- multiple database registrations
- multiple schemas
- connection management
- complexe transaction handling

This means the same architecture can scale from a very small example to more advanced applications requiring several databases, schema separation, controlled connector usage, and transactional operations.

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
docker compose exec postgres psql -U appcore -d appcore -f /examples/01-minimal-app/init.sql
```

## Install dependencies

From this example directory:

```bash
npm install
```

## Initialize the example

Generate the minimal application structure without model generation:

```bash
npm run init
```

This command runs:

```bash
core-app 
```

This creates a minimal project structure.

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
await connector.query("SELECT * FROM minimal_app.item");
let row = await connector.next();
while(row)
{
    //..do some stuff here
    Log.info(row);
    row = await connector.next();
}
```

## Run the example

```bash
npm run start
```

or

```bash
node index.js
```

## Notes

- This example is intentionally minimal.
- It relies on the shared PostgreSQL service defined in `examples/compose.yaml`.
- The database schema for this example contains a single `item` table.
- The same database layer is designed to support multi-database and multi-schema applications.
- Connector usage, connection management, and transactions are handled through the framework database layer.
```