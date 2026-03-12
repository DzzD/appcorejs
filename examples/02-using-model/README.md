# Using Model

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
docker compose exec postgres psql -U appcore -d appcore -f /examples/02-using-model/init.sql
```

## Install dependencies and generate the model

From this example directory:

```bash
npm install
npm run init
```

The `init` script runs:

```bash
app-core --database appcore --schema minimal_app --user appcore --password appcore
```

## Run the example

```bash
npm run start
```

## Notes

- This example depends on the same shared PostgreSQL service defined in `examples/compose.yaml`.
- `npm run init` must be executed once to generate the models inside `app/db/models/` before running the script.
