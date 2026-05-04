# 003 - Backend

This chapter explains the backend layer before deep ORM details.

## Backend entry point

Use `--back` to synchronize backend layers:

- `./core/`
- `./app/`
- `./<project>/db/*`
- `./index.js`

See [001 - app-core CLI](./001-app-core-cli.md).

## Backend philosophy

- `core/db/*` contains internal engine logic.
- `app/db/*` is the mandatory ORM interface.
- `./<project>/db/*` contains business models and business queries.

Project code uses `app` API.
Project business services and backend workflow code should not use `core` directly.

## Backend class chain

For generated models, inheritance is layered.

```text
User -> CoreUser -> DbObject -> CoreDbObject
```

- `CoreDbObject`: internal ORM engine.
- `DbObject` (`app/db/DbObject.js`): global ORM interface layer.
- `CoreUser` (`core/db/models/CoreUser.js`): generated technical model class.
- `User` (`<project>/db/models/User.js`): business model class.

## Minimal generated model shape

`./<project>/db/models/User.js`

```js
import { CoreUser } from '../../../core/db/models/CoreUser.js';

export class User extends CoreUser
{
}
```

This is intentional.

`User` does not extend `DbObject` directly.
It extends `CoreUser`, which already extends `DbObject`.

So ORM model inheritance is a controlled generated bridge.
Global ORM behavior still passes through `app/db/DbObject.js`.

## Why this chain matters

If you override `DbObject`, you affect all ORM models.

If you override `User`, you affect only `User`.

This gives two levels of control:

- global ORM behavior in `app/db/DbObject.js`
- business-specific behavior in `./<project>/db/models/*.js`

## Typical project backend structure

```text
./<project>/
  db/
    models/
    queries/
  server/
```

## Cross-reference

- Detailed ORM API: [004 - Model / ORM](./004-model-orm.md)
- Server integration: [005 - Server](./005-server.md)
