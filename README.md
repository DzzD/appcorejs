![AppCore<sub>JS</sub> logo](./docs/images/app-core-logo-1024.png)

# AppCore<sub>JS</sub> Framework

AppCore<sub>JS</sub> is a layered framework for Node.js applications.

The rule is strict:

```text
project -> app -> core
```

`core` is internal.
`app` is the mandatory interface.
Project code uses `app`, never `core` directly.

---

## Quick Start

Minimal full command (all layers):

```bash
npx app-core --back --server --front --model --project myProject --dbuser appcore --dbpassword appcore --dbname appcore
```

Generated structure (current directory):

```text
./core/
./app/
./myProject/
./myProject/public/
./server.js
./index.js
```

Run the server:

```bash
node server.js
```

Open:

- `http://127.0.0.1:3000`

---

## Global Concept

### `core`
- internal engine
- framework internals
- not intended to be used directly

### `app`
- framework interface
- mandatory entry point
- place to adapt framework behavior globally

### `project` (`./<project>/`)
- business code
- business models, queries, server components, frontend components/screens
- uses `app` only

Fundamental rule:

```text
project -> app -> core
```

Never:

```text
project -> core
```

---

## Why `app` is mandatory

`app` is your control layer.
You can change framework behavior without patching `core`.

Example: global save rule in `app/db/DbObject.js`.

```js
import { CoreDbObject } from '../../core/db/CoreDbObject.js';

export class DbObject extends CoreDbObject
{
    async save(forceInsert = false)
    {
        if ('updatedAt' in this)
        {
            this.updatedAt = new Date();
        }

        return await super.save(forceInsert);
    }
}
```

This check is functional.
It applies only when the model has `updatedAt`.

---

## Project Vision

```text
./core/
./app/
./myProject/
  db/
  server/
  public/
```

- `core/`: framework internals.
- `app/`: framework interface layer.
- `myProject/`: business layer.

---

## Domain Overview

### Backend
- ORM classes are exposed through `app/db/*`.
- project models are in `./<project>/db/models/`.

### Server
- server base class is `app/server/Server.js`.
- project server extends it in `./<project>/server/`.

### Frontend
- frontend root is `./<project>/public/`.
- `public/core`: frontend engine.
- `public/app`: frontend interface.
- `public/components` and `public/screens`: project UI code.

### Models
- generated with `--model`.
- app model classes generated in `./<project>/db/models/`.
- core base model classes generated in `./core/db/models/`.

---

## Documentation

Start here:

- [Documentation index](./docs/README.md)

Direct access:

- [001 - app-core CLI](./docs/001-app-core-cli.md)
- [002 - Architecture](./docs/002-architecture.md)
- [003 - Backend](./docs/003-backend.md)
- [004 - Model / ORM](./docs/004-model-orm.md)
- [005 - Server](./docs/005-server.md)
- [006 - Frontend](./docs/006-frontend.md)
- [007 - Examples](./docs/007-examples.md)

---

## Author

Bruno Augier (aka DzzD)
