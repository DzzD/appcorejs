<p align="center">
  <img src="./docs/images/global-appcore-logo-256.png" alt="AppCoreJS logo">
</p>

# AppCore<sub>JS</sub> Framework

AppCore<sub>JS</sub> is a **lightweight JavaScript framework** and **application generator** focused on **layered overrides**, **code factorization**, and interoperability with standard web and Node.js code.

It generates a **working application out of the box**, from backend/script projects to full server + frontend applications. The generated structure is designed to be **extended, specialized, or overridden** instead of rewritten from scratch.

Its architecture separates the **framework core**, the **global application layer**, and the **project-specific layer**. The app layer can override core classes and global behavior once, while each project can still specialize or extend what it needs locally. This makes it possible to **factorize most of the code**, keep projects small, and adapt the framework deeply without modifying its core.

AppCore<sub>JS</sub> also provides a **complete ORM layer** that can be **generated and regenerated from multiple databases and multiple schemas** without losing project-specific specializations.

Generated **model classes can be extended** through the same layered override approach, so database changes can be reflected safely while keeping custom business logic and rules intact.

The query system also supports **advanced queries mixing multiple model objects**, making it possible to build rich aggregated results, joins, search screens, detail views, and domain-specific data structures without duplicating low-level SQL logic everywhere.

The frontend is built entirely with **standard HTML5, CSS3, and ES6 JavaScript**. AppCore<sub>JS</sub> components can be mixed naturally with regular **Node.js, HTML, CSS, and vanilla JavaScript** code, so projects are not locked into a rigid framework-only approach.

Because AppCore<sub>JS</sub> stays deliberately **lightweight**, generated applications remain **simple**, **fast to load**, and **fluid in use**.

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
- business models, queries, server components, frontend components (optional screen split)
- uses `app` only

Fundamental rule:

```text
project -> app -> core
```

Never:

```text
project -> core
```
![AppCore<sub>JS</sub> Architecture](./docs/images/global-design.png)

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
- `public/components`: recommended project frontend folder.
- `public/screens`: optional project structure when a screen split is needed.
- `public/ext`: generated only with `--front --ext` (or `--front --intro`).
- `public/intro`: generated only with `--front --intro`.

### Models
- generated with `--model`.
- project model classes generated in `./<project>/db/models/`.
- core base model classes generated in `./core/db/models/`.
- never generated in `./app/db/models/`.

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
- [006 - Frontend](./docs/006-0-frontend.md)
- [007 - Examples](./docs/007-examples.md)

---

## Author

Bruno Augier (aka DzzD)
