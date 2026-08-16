# 001 - app-core CLI

`app-core` synchronizes framework layers and project layers in the target root directory.

## Command shape

```bash
app-core --project myProject [--target prj] --back --server --front [--ext] [--intro] --model
```

`--project <name>` is mandatory.

`--target <dir>` is optional.

## Options

### `--project <name>`
Target business project/module name.

### `--target <dir>`
Destination root directory used for generation.

Default: current directory.

Example with `--target prj`:

```text
prj/app/
prj/core/
prj/<project>/
prj/<project>/public/
prj/server.js
prj/index.js
```

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

- `<target>/core/` replaced completely.
- `<target>/app/` synchronized without overwrite.
- `<target>/<project>/db/` synchronized for project overrides.
- `<target>/index.js` created if missing.

### Frontend (`--front`)

Target root: `<target>/<project>/public/`

- `public/core/` replaced completely.
- `public/app/` synchronized without overwrite.
- other `public/*` copied only if missing.
- `public/ext/` copied only when `--ext` (or `--intro`) is used.
- `public/intro/` copied only when `--intro` is used.

### Server (`--server`)

Created if missing:

- `<target>/server.js`
- `<target>/<project>/server/`
- `<target>/<project>/server/components/`
- `<target>/<project>/server/<ProjectClassName>Server.js`

### Models (`--model`)

Generated in:

```text
<target>/app/db/models/
<target>/core/db/models/
```

Optional override layer remains:

```text
<target>/<project>/db/models/
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

With explicit target root:

```bash
npx app-core --back --server --front --project myProject --target prj
```
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
