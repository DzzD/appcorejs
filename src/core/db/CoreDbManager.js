/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { Pool } from 'pg';
import util from 'node:util';
import { Log } from '../../app/Log.js';
import { DbConnector } from '../../app/db/DbConnector.js';
import { DbManager } from '../../app/db/DbManager.js';

export class CoreDbManager
{
    static _databases = new Map();
    static _connections = new Map();

    static [util.inspect.custom]()
    {
        const databases = Array.from(DbManager._databases.keys());
        const connections = {};

        Array.from(DbManager._connections.values()).forEach((client) =>
        {
            connections[client.connectionUid] = client.database.config.database;
        });

        return {
            databases,
            connections
        };
    }

    static addDatabase(config)
    {
        const database = DbManager._databases.get(config.database);

        if (database)
        {
            throw new Error(`Base de données déjà existante ${config.database}`);
        }

        const poolSize = config.poolSize ?? 50;
        const poolConfig = { ...config, max: poolSize };
        delete poolConfig.poolSize;

        const pool = new Pool(poolConfig);

        DbManager._databases.set(config.database,
        {
            name: config.database,
            config,
            pool
        });
    }

    static async getClient(databaseName = null, connectionUid = "default")
    {
        databaseName = databaseName ?? DbManager._getFirstDatabaseName();

        const database = DbManager._databases.get(databaseName);

        if (!database)
        {
            throw new Error((`Base de données manquante ${databaseName}`));
        }

        let client = DbManager._connections.get(connectionUid);

        if(client)
        {
            if(client.connectionUid != connectionUid && client.database != database)
            {
                throw new Error((`Mixed client, connection ${connectionUid}, database ${databaseName}`));
            }
            return client;
        }
            
        client = await database.pool.connect(); 
        client.database = database;
        client.connectionUid = connectionUid;
        DbManager._connections.set(connectionUid, client);

        return client;
    }


    static releaseConnection(connectionUid = "default")
    {
        const client = DbManager._connections.get(connectionUid);    
        DbManager._connections.delete(connectionUid);
        delete client.connectionUid;
        delete client.database;
        client.release();
        // DbManager.releaseClient(client);   
    }

    static releaseAllConnections()
    {
        Array.from(DbManager._connections.keys()).forEach((connectionUid) =>
        {
            DbManager.releaseConnection(connectionUid);
        });
    }

    static async removeDatabase(databaseName)
    {
        const database = DbManager._databases.get(databaseName ?? DbManager._getFirstDatabaseName());
        Array.from(DbManager._connections.values()).forEach((client) =>
        {
            if(client.database == database)
            {
                DbManager.releaseConnection(client.connectionUid);
            }
        });
        await database.pool.end();
        DbManager._databases.delete(databaseName);
    }

    static getConnector(databaseName = null, connectionUid = "default")
    {
        const resolvedDatabaseName = databaseName ?? DbManager._getFirstDatabaseName();
        const info = DbManager._databases.get(resolvedDatabaseName);

        if (!info)
        {
            throw new Error(`Base de données manquante ${resolvedDatabaseName}`);
        }

        const connector = new DbConnector();
        connector.databaseName = resolvedDatabaseName;
        connector._connectionUid = connectionUid;
        return connector;
    }

    static _getFirstDatabaseName()
    {
        const firstDatabaseEntry = CoreDbManager._databases.keys().next();

        return firstDatabaseEntry.value;
    }
}
