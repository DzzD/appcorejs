# 01 - Using Database Basic

This example shows the smallest backend workflow with AppCoreJS.

It uses:

- `DbManager` to declare a database
- `DbConnector` to run SQL directly
- shared schema `minimal_app`

No model generation is required.

## Requires database

Yes.

Use the shared DB setup described in:

- [`../README.md`](../README.md)

## Install dependencies

From this example directory:

```bash
npm install
```

## Initialize AppCoreJS structure

```bash
npm run init
```

Script executed:

```bash
app-core --back --project project
```

This creates/synchronizes:

- `app/`
- `core/`
- `project/`

## Run the example

```bash
npm run start
```

or

```bash
node index.js
```

## What the example does

`index.js`:

- registers database `appcore`
- inserts rows into `minimal_app.item`
- reads rows and prints them
- closes connector and releases database

Simplified extract:

```js
import { DbManager } from './app/db/DbManager.js';

DbManager.addDatabase(
{
    host: 'localhost',
    port: 5432,
    user: 'appcore',
    password: 'appcore',
    database: 'appcore'
});

const connector = DbManager.getConnector('appcore');
await connector.query('SELECT * FROM minimal_app.item');
```

See full source: [`./index.js`](./index.js)
