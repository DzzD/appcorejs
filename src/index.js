

import { DbManager } from './app/db/DbManager.js';
import { Log } from './app/Log.js';
import { SeriousQuizUser } from './app/db/models/SeriousQuizUser.js';
import { SeriousQuizUserGroup } from './app/db/models/SeriousQuizUserGroup.js';


DbManager.addDatabase(
{
    host: 'localhost',
    port: 5432,
    database: 'serious_quiz',
    user: 'dev',
    password: 'devpass'
});

const dbConnector = DbManager.getConnector('serious_quiz');
await dbConnector.query
(`
    SELECT
        to_jsonb (ug) as ug,
        to_jsonb (u) - 'id' as u
    FROM
        "user" u
        LEFT JOIN user_group ug on u.id = ug.user_id
`);

Log.info(`dbConnector.recordCount() = ${dbConnector.recordCount()}`);
Log.info(dbConnector._connectionUid);
let user = SeriousQuizUser.from(dbConnector,"u");
let userGroup = SeriousQuizUserGroup.from(dbConnector,"ug");
// process.exit(0);


for(let result; result = await dbConnector.next();)
{
    // Log.info(result);
    
    // Log.info(user.login);
    // Log.info(`userAccount.email = ${user.password}`);
}
// Log.info(`DbConnector query returned ${dbConnector.recordCount()} rows, first row: ${JSON.stringify(dbConnectorResult)}`);
// Log.info(DbManager._connections.keys());
Log.info(DbManager);
dbConnector.close();
Log.info(DbManager);
await DbManager.removeDatabase('serious_quiz');
// Log.info(DbManager);
process.exit(0);

let n = 0;
const mixe = new SampleMixe();
await mixe.search(' "valeur-b" LIKE $1 ', ['aa%'],{order: '"valeur-a" ASC'});
// mixe.valeurA = n++;
// await mixe.save();
while(await mixe.next())
{
    // Log.info(`mixe.searchRecordCount = ${mixe.searchRecordCount()} `);
    mixe.valeurA = n++;
    // Log.info(`mixe..save()`);
    await mixe.save();
    // Log.info(`mixe..save() ok`);
}
// Log.info(`Ending`);
// Log.info(DbManager);
mixe.close();
// DbManager.releaseConnection("111");
// DbManager.releaseAllClients();
// Log.info(DbManager);



process.exit(0);
