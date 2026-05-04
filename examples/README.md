# Examples

This folder contains focused AppCoreJS examples.

Each example has:

- a local `README.md`
- a minimal source file (`index.js`)
- a local `package.json` with `init` and `start` scripts

## Shared database environment (single setup)

All DB-based examples use the same PostgreSQL container and the same SQL bootstrap script.

- Docker definition: `examples/compose.yml`
- SQL bootstrap: `examples/init.sql`

From `examples/`, run this single command:

```bash
docker compose up -d && docker compose exec postgres psql -U appcore -d appcore -f /examples/init.sql
```

Stop the shared DB with:

```bash
docker compose down
```

## Available examples

### 01 - using-database-basic

- requires DB: yes
- schema used: `minimal_app`
- focus: direct SQL with `DbConnector`

See: [`./01-using-database-basic/README.md`](./01-using-database-basic/README.md)

### 02 - using-model-basic

- requires DB: yes
- schema used: `minimal_app`
- focus: model generation + ORM usage

See: [`./02-using-model-basic/README.md`](./02-using-model-basic/README.md)



### WIP : More examples soon...


## Standard workflow inside one example

```bash
npm install
npm run init
npm run start
```
