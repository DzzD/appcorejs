import { DbManager } from './app/db/DbManager.js';
import { Log } from './app/Log.js';
import { DataItem } from './app/db/models/DataItem.js';



// Log.setMode('info');

DbManager.addDatabase(
{
    host: 'localhost',
    port: 5432,
    user: 'appcore',
    password: 'appcore',
    database: 'appcore',
    ssl: false
});

// Step 1: simple insert into Item data object.
const item = new DataItem();
item.name = `Model example ${new Date().toISOString()}`;
await item.save();


// Step 2: simple update of the current row.
item.name = `${item.name} (updated)`;
await item.save();

// Step 3: simple read of the whole Item data object.
await item.search();

while (await item.next())
{
    Log.info('Persisted item:', item.id, item.name);
}


await DbManager.removeDatabase('appcore');
