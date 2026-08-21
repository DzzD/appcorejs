# APPCOREJS ORM

## Database Access Rule

Except for an exceptional and explicitly justified low-level need, application code must not access PostgreSQL or `DbConnector` directly.

Use:

- a `DbObject` for operations directly concerning one model;
- a `DbQueryObject` for searches, specific SQL, joins, and assembly of several objects.

Do not scatter SQL through server components. Do not add parallel Repository or Service layers merely to bypass `DbObject` and `DbQueryObject`.

## Generated `DbObject` Levels

Running `--model` introspects PostgreSQL and creates:

```text
app/db/models/Greeting.js
	-> core/db/models/CoreGreeting.js
		-> app/db/DbObject.js
			-> core/db/CoreDbObject.js
```

- `core/db/models/CoreGreeting.js` is generated directly from PostgreSQL and regenerated. Do not edit it.
- `app/db/models/Greeting.js` is marked `ONE-SHOT GENERATED FILE`. It is created only when missing, then can be freely modified.
- `app/db/DbObject.js` is also one-shot and is the global override point for every generated model.
- An optional `<project>/db/models/` class may extend the app model for project-specific specialization. The current generator does not create this level automatically.

Each level can add state, methods, and overrides while inheriting schema metadata and persistence from the previous level. Project code imports app models, or its project specialization when one exists, never generated core models directly.

## Global `DbObject` Override

A rule in `app/db/DbObject.js` applies to all generated models. For example, timestamps can be centralized instead of repeated in every model:

```js
beforeInsert()
{
	const now = new Date().toISOString();

	this.#setTimestampField('created_at', now);
	this.#setTimestampField('updated_at', now);

	return super.beforeInsert();
}

beforeUpdate()
{
	this.#setTimestampField('updated_at', new Date().toISOString());

	return super.beforeUpdate();
}

#setTimestampField(columnName, value)
{
	const fieldMeta = this._fields?.[columnName];

	if (!fieldMeta)
	{
		return;
	}

	const attributeName = fieldMeta.attributeName;

	if (!attributeName)
	{
		return;
	}

	this[attributeName] = value;
}
```

Current save hooks are synchronous; keep these overrides synchronous and call `super` when parent behavior must run.

## Model Specialization

A model need not map 1:1 to another PostgreSQL table. Application classes may specialize an existing generated model:

```js
export class WebchatMessage extends WebchatEvent
{
	constructor(connectionUid = null)
	{
		super(connectionUid);

		this.attachments = [];
		this.attachmentRefs = [];
		this.routeBasePath = '/webchat/api';
		this._contentPreparation = null;
	}
}
```

`WebchatMessage` represents a message event by extending `WebchatEvent`; no `webchat_message` table is required. Generated models provide the SQL-backed base, while application levels build the object model actually used by the application.

## `DbQueryObject`

A `DbQueryObject` owns a specific SQL query. It may join tables and reconstruct one or more models from JSON aliases returned by the query.

```js
import { DbQueryObject } from '../DbQueryObject.js';
import { WebchatAttachment } from '../models/WebchatAttachment.js';

export class DbQueryWebchatAttachmentForUser extends DbQueryObject
{
	constructor(connectionUid = 'default')
	{
		super('webchat', connectionUid);

		this._query = `
			SELECT
				to_jsonb(attachment) - 'content' AS attachment,
				attachment.content AS attachment_content,
				attachment.uuid AS attachment_uuid,
				stream_user.user_uuid AS authorized_user_uuid
			FROM attachment
			INNER JOIN event
				ON event.uuid = attachment.event_uuid
			INNER JOIN stream_user
				ON stream_user.stream_uuid = event.stream_uuid
		`;

		this.addDbObject(WebchatAttachment, 'attachment', 'attachment');
	}

	async next()
	{
		const row = await super.next();

		if (row)
		{
			this.attachment.content = row.attachment_content;
			this.attachment._content = row.attachment_content;
		}

		return row;
	}
}
```

- `_query` contains the specific query and joins.
- `addDbObject(Class, name, alias)` creates a mapped model. The SQL JSON alias and `alias` argument must match.
- After `await search()`, each `await next()` reconstructs mapped objects and returns the raw row.
- The mapped instance is available as `this.attachment` or through `getDbObject('attachment')`.
- Override `next()` to complete or adapt the reconstructed object. Here `content` is intentionally selected separately and reassigned.
- Call `close()` when iteration is complete.

`search(where, params, options)` wraps `_query` as a subquery. Any outer `where` or `order` expression must reference columns exposed by `_query`, not its internal table aliases.

## Transactions

When several operations must be atomic, use the same explicit `connectionUid` for their models, queries, and connector. Open and finish the transaction through a connector:

```js
const connector = DbManager.getConnector('webchat', connectionUid);

await connector.beginTransaction();

try
{
	await firstObject.save();
	await secondObject.save();
	await connector.commit();
}
catch (error)
{
	await connector.rollback();
	throw error;
}
```

The connector is used here for transaction control, not as the normal query API.

## Global `DbConnector` Override

`app/db/DbConnector.js` is a low-level, transversal override point for every database access. Instrumentation can be centralized there:

```js
async query(sql, params = [])
{
	const startedAt = process.hrtime.bigint();

	try
	{
		return await super.query(sql, params);
	}
	finally
	{
		const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

		Log.debug(
			'[DbConnector][query][duration]',
			this.databaseName,
			`${durationMs.toFixed(2)}ms`
		);
	}
}
```

This measures every query without modifying each `DbQueryObject`. It does not make `DbConnector.query()` the normal application-level access API.

## PostgreSQL Schema Workflow

```text
modify or add SQL
-> apply the change to PostgreSQL
-> regenerate DbObject classes
-> adapt or create the required DbQueryObject classes
```

PostgreSQL is the source of truth for table structure, types, foreign keys, constraints, `UNIQUE`, indexes, and defaults. Keep schema changes in versioned SQL rather than editing generated model metadata.
