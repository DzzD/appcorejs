

import { DbManager } from './app/db/DbManager.js';
import { DbConnector } from './app/db/DbConnector.js';
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
console.log(dbConnector._connectionUid);
let user = SeriousQuizUser.from(dbConnector,"u");
let userGroup = SeriousQuizUserGroup.from(dbConnector,"ug");
// process.exit(0);


for(let result; result = await dbConnector.next();)
{
    // console.log(result);
    
    // console.log(user.login);
    // Log.info(`userAccount.email = ${user.password}`);
}
// Log.info(`DbConnector query returned ${dbConnector.recordCount()} rows, first row: ${JSON.stringify(dbConnectorResult)}`);
// console.log(DbManager._connections.keys());
 console.log(DbManager);
dbConnector.close();
console.log(DbManager);
await DbManager.removeDatabase('serious_quiz');
// console.log(DbManager);
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
// console.log(DbManager);
mixe.close();
// DbManager.releaseConnection("111");
// DbManager.releaseAllClients();
// console.log(DbManager);



process.exit(0);
