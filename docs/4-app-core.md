# app-core.js

## Overview

`app-core` orchestrates synchronisation between the framework template and your application. Run it via `npx app-core` (or after a global install) to refresh frontend assets, backend sources, and database models in a controlled way.

Each synchronisation entry point mirrors the behaviour of its dedicated script:

- `AppCore.front.js` handles public assets and the project entry point.
- `AppCore.back.js` manages `app/` and `core/` back-end baseline code.
- `AppCore.model.js` builds or updates database models.

## CLI options

### `--front`

Synchronises the frontend bundle by copying the framework `src/public/` directory into your project `public/` folder. The command keeps existing project overrides whenever possible and only copies the default `index.js` entry if it does not already exist.

```bash
npx app-core --front
```

### `--back`

Synchronises the backend baseline. Application files under `src/app/` are copied without overwriting existing project files, while `src/core/` files are always refreshed to guarantee framework consistency. The command logs `[app-core] Backend synchronisation...` to highlight the operation.

```bash
npx app-core --back
```

### `--model`

Synchronises database models using the configuration flags (`--dbuser`, `--dbpassword`, `--dbname`, `--dbschema`, `--model-prefix`, `--noprefix`). Invoking `--model` automatically implies `--back` so that freshly generated models land alongside an up-to-date backend baseline.

```bash
npx app-core --model --dbuser admin --dbpassword secret --dbname app
```

## Synchronisation summary

- **Frontend (`--front`)** copies the framework `src/public/` directory into your project `public/` folder. Existing user files stay in place; the default `index.js` entry is created only when missing.
- **Backend (`--back`)** refreshes `core/` files from the framework while keeping custom code in `app/` untouched so you can extend the baseline safely.
- **Models (`--model`)** require database credentials, regenerate only the `core/` model files, and leave any customised `app/` models untouched so you can extend the baseline safely. The command also refreshes the backend baseline because `--model` implies `--back`.

## CLI parameters

- `--front` triggers the frontend synchronisation described above.
- `--back` triggers the backend synchronisation described above.
- `--model` refreshes database models and implicitly enables `--back`.
- `--dbuser` supplies the database user name for model generation.
- `--dbpassword` supplies the password associated with `--dbuser`.
- `--dbname` selects the database to introspect when building models.
- `--dbschema` limits model generation to a specific schema (defaults to all schemas when omitted).
- `--dbhost` overrides the database host (defaults to `localhost`).
- `--dbport` overrides the database port (defaults to `5432`).
- `--model-prefix` controls the naming prefix applied to generated classes (defaults to the database name when omitted).
- `--noprefix` is a shortcut that enables `--model` with an empty prefix instead of the database-name default.
