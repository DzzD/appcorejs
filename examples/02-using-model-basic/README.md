# 02 - Using Model Basic

This example shows model generation + ORM usage on a simple table.

It uses:

- `app-core --model` to generate ORM classes
- `DbManager` for DB declaration
- generated `DataItem` model for CRUD operations

## Requires database

Yes.

Use the shared DB setup described in:

- [`../README.md`](../README.md)

## Install dependencies

From this example directory:

```bash
npm install
```

## Generate framework + models

```bash
npm run init
```

Script executed:

```bash
app-core --model --project project --dbname appcore --dbschema minimal_app --dbuser appcore --dbpassword appcore --model-prefix data

# equivalent with explicit target root
app-core --model --project project --target . --dbname appcore --dbschema minimal_app --dbuser appcore --dbpassword appcore --model-prefix data
```

Generated model location:

```text
./app/db/models/
```

`item` is generated as `DataItem` (because of `--model-prefix data`).

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
- creates one `DataItem`
- updates it
- searches and prints rows

Simplified extract:

```js
import { DataItem } from './project/db/models/DataItem.js';

const item = new DataItem();
item.name = 'Model example';
await item.save();

await item.search();
while (await item.next())
{
    Log.info(item.id, item.name);
}
```

See full source: [`./index.js`](./index.js)

## Note

This example demonstrates the `project -> app -> core` model chain in practice.
