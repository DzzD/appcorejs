# 005 - Server

AppCoreJS server runtime is component-based.

A server is a host.
Features are provided by `ServerComponent` instances.

## Layer model

- `core/server/*`: internal engine
- `app/server/*`: mandatory interface layer
- `./<project>/server/*`: business server code

## Server composition

A project server extends `app/server/Server.js` and registers components.

```js
import { Server } from '../../app/server/Server.js';
import { StaticFileServerComponent } from '../../app/server/components/StaticFileServerComponent.js';

export class MyProjectServer extends Server
{
    constructor()
    {
        super();

        this.registerServerComponent(new StaticFileServerComponent());
    }

    get baseDirectory()
    {
        return '/absolute/path/to/myProject';
    }
}
```

## Why `baseDirectory` is mandatory

`CoreServer` requires `baseDirectory`.

Static file resolution uses this path.

Example: `StaticFileServerComponent('public')` resolves to:

```text
<baseDirectory>/public
```

Without `baseDirectory`, static/project file resolution is ambiguous.

## registerServerComponent

Use:

```js
this.registerServerComponent(component);
```

Lifecycle is automatic:

- on server `start()`: components start in registration order
- on server `stop()`: components stop in reverse order

## ServerComponent as global server interface

All project server components should extend `app/server/ServerComponent.js`.

This allows global behavior to be centralized in one place.

### Example: add shared helpers to all server components

`app/server/ServerComponent.js`

```js
import { CoreServerComponent } from '../../core/server/CoreServerComponent.js';

export class ServerComponent extends CoreServerComponent
{
    get appName()
    {
        return this.server.appName;
    }
}
```

Then every project component can use `this.appName`.

By default, `app/server/*` classes are usually minimal.
This is normal.

They are override points for global server behavior.
Project-specific behavior remains in `./<project>/server/*`.

## Component types

A server can mix multiple protocols through components:

- HTTP endpoints
- WebSocket
- SSE
- mixed protocol components

## Typical generated structure

```text
./<project>/server/
  <ProjectClassName>Server.js
  components/
```

## Cross-reference

- CLI generation rules: [001 - app-core CLI](./001-app-core-cli.md)
- Architecture: [002 - Architecture](./002-architecture.md)
- ORM integration: [004 - Model / ORM](./004-model-orm.md)
- Frontend/static relation: [006 - Frontend](./006-0-frontend.md)
