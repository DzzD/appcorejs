# Minimal App

This example demonstrates the smallest practical AppCore setup with a PostgreSQL database.

It uses a simple `item` table and shows how to initialize a minimal application structure without generating model classes.

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
core-app --nomodel
```

## Run the example

```bash
npm run start
```

## Notes

- This example is intentionally minimal.
- It relies on the shared PostgreSQL service defined in `examples/compose.yaml`.
- The database schema for this example contains a single `item` table.