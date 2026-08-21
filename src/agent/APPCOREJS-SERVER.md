# APPCOREJS SERVER

## Application Server Structure

- Root `server.js` configures runtime dependencies, instantiates the generated project server, and starts it.
- `<project>/server/<Project>Server.js` composes the project server and is created only once.
- `<project>/server/components/` contains business HTTP components.
- `app/server/` contains application-wide server overrides.
- `core/server/` is synchronized framework code and must not be modified.

Project classes extend app classes, not core classes.

## `ServerComponent`

A `ServerComponent` is a focused unit registered with `registerServerComponent(...)`. Its `start()` method registers routes or starts its resource; `stop()` releases it when needed.

```js
import { ServerComponent } from '../../../app/server/ServerComponent.js';

export class HelloServerComponent extends ServerComponent
{
	async start()
	{
		this.server.application.get('/api/hello', async (request, response, next) =>
		{
			try
			{
				response.json(await this.getHello());
			}
			catch (error)
			{
				next(error);
			}
		});
	}
}
```

Register project API components in the project server, normally before `StaticFileServerComponent`:

```js
this.registerServerComponent(new HelloServerComponent());
this.registerServerComponent(new StaticFileServerComponent());
```

The server starts components in registration order and stops them in reverse order.

## Database Access from Routes

Keep HTTP handling in the server component and database behavior in ORM objects:

- use a `DbObject` for one model's insert, update, delete, or simple search;
- use a project `DbQueryObject` for specific queries, joins, and multi-object results;
- close query cursors when finished;
- use one explicit connection UID and a transaction when multiple writes must be atomic.

Do not call PostgreSQL or `DbConnector.query()` directly from a route except for a documented exceptional low-level need. Do not scatter SQL across server components.

Register databases through `DbManager.addDatabase(...)` before `server.start()`. The configured database name must match the name passed to `DbQueryObject` and generated model metadata.

Use `APPCOREJS-HELLO-WORLD.md` for a complete minimal route backed by PostgreSQL.
