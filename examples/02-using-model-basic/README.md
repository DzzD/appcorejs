# Using Model Basic

This example extends the minimal setup by generating data objects with AppCore and using them to interact with the same `minimal_app.item` table.

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
docker compose exec postgres psql -U appcore -d appcore -f /examples/02-using-model-basic/init.sql
```

## Install dependencies and generate the model

From this example directory:

```bash
npm install
npm run init
```
The `init` script runs:
 
```bash
app-core --dbname appcore --schema minimal_app --dbuser appcore --dbpassword appcore --model-prefix data --model
```

This creates the model objects using the optional `Data` prefix, so the `item` table classe becomes `DataItem`.

#### Usage example:

`index.js`
```js
import { DataItem } from './app/db/models/DataItem.js';
import { DbManager } from './app/db/DbManager.js';

DbManager.addDatabase(
{
    host: 'localhost',
    port: 5432,
    user: 'appcore',
    password: 'appcore',
    database: 'appcore'
});

const item = new DataItem();
item.name = "John Doe";
item.save();
```

See [`index.js`](./index.js) for the full code.

## Run the example

```bash
npm run start
or
node index.js
```

## Notes

- This example depends on the same shared PostgreSQL service defined in `examples/compose.yaml`.
- `npm run init` must be executed once to generate the models inside `app/db/models/` before running the script.
