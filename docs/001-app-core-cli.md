# 001 - app-core CLI

`app-core` synchronizes framework layers and project layers in the current directory.

## Command shape

```bash
app-core --project myProject --back --server --front [--ext] [--intro] --model
```

`--project <name>` is mandatory.

## Options

### `--project <name>`
Target business project/module name.

### `--back`
Synchronizes backend layers and backend entrypoint.

### `--front`
Synchronizes frontend layers into `./<project>/public/`.

### `--ext`
Synchronizes external frontend modules into `./<project>/public/ext/`.

Constraint:

- requires `--front`

### `--intro`
Synchronizes intro files into `./<project>/public/intro/`.

Constraints:

- requires `--front`
- implies `--ext`

### `--server`
Creates/updates server entrypoint and project server class.

### `--model`
Generates ORM models from database schema.

Model generation requires:

- `--dbuser`
- `--dbpassword`
- `--dbname`

Optional model options:

- `--dbhost`
- `--dbport`
- `--dbschema`
- `--model-prefix`
- `--model-noprefix`

## Dependencies

- `--model` implies `--back`
- `--server` implies `--back`
- `--intro` implies `--ext`
- `--intro` requires `--front`
- `--ext` requires `--front`

## Synchronization summary

### Backend (`--back`)

- `./core/` replaced completely.
- `./app/` synchronized without overwrite.
- `./<project>/db/models/` created if missing.
- `./<project>/db/queries/` created if missing.
- `./index.js` created if missing.

### Frontend (`--front`)

Target root: `./<project>/public/`

- `public/core/` replaced completely.
- `public/app/` synchronized without overwrite.
- other `public/*` copied only if missing.
- `public/ext/` copied only when `--ext` (or `--intro`) is used.
- `public/intro/` copied only when `--intro` is used.

### Server (`--server`)

Created if missing:

- `./server.js`
- `./<project>/server/`
- `./<project>/server/components/`
- `./<project>/server/<ProjectClassName>Server.js`

### Models (`--model`)

Generated in:

```text
./<project>/db/models/
./core/db/models/
```

Never in:

```text
./app/db/models/
```

## Concrete examples

Backend only:

```bash
npx app-core --back --project myProject
```

Backend + server:

```bash
npx app-core --back --server --project myProject
```

Backend + server + frontend:

```bash
npx app-core --back --server --front --project myProject
```

Frontend + ext only:

```bash
npx app-core --front --ext --project myProject
```

Frontend + intro (implies ext):

```bash
npx app-core --front --intro --project myProject
```

Frontend + intro + ext:

```bash
npx app-core --front --intro --ext --project myProject
```

Invalid usage examples:

```bash
npx app-core --intro --project myProject
npx app-core --ext --project myProject
npx app-core --intro --ext --project myProject
```

Full generation with models:

```bash
npx app-core --back --server --front --model --project myProject --dbuser appcore --dbpassword appcore --dbname appcore
```

## Next

Continue with [002 - Architecture](./002-architecture.md).
