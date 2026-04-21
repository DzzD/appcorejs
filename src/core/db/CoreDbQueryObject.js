/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { Error } from '../../app/Error.js';
import { DbManager } from '../../app/db/DbManager.js';


export class CoreDbQueryObject
{
    _databaseName;
    _connectionUid;
    _searchConnector;
    _query;
    _dbObjects;

    constructor(databaseName, connectionUid = "default")
    {
        if (!databaseName)
        {
            throw new Error('CoreDbQueryObject requiert un nom de base de données.');
        }

        this._databaseName = databaseName;
        this._connectionUid = connectionUid;
        this._searchConnector = null;
        this._query = null;
        this._dbObjects = new Map();
    }


    async search(where = null, params = [], { limit = null, order = null } = {})
    {
        if (!this._searchConnector)
        {
            this._searchConnector = DbManager.getConnector(this._databaseName, this._connectionUid);

            for (const [key, meta] of this._dbObjects.entries())
            {
                const instance = meta.ClassRef.from(this._searchConnector, meta.alias);
                meta.instance = instance;
                this._dbObjects.set(key, meta);
            }
        }

        let sql = this._query ?? '';

        if (where)
        {
            sql += ' WHERE ' + where;
        }

        if (order)
        {
            sql += ' ORDER BY ' + order;
        }

        if (limit != null)
        {
            sql += ' LIMIT ' + limit;
        }

        await this._searchConnector.query(sql, params);

        return this;
    }


    addDbObject(ClassRef, alias = null)
    {
        if (!ClassRef)
        {
            return null;
        }

        const key = alias ?? ClassRef.name;
        const meta =
        {
            ClassRef,
            alias,
            instance: null
        };

        if (this._searchConnector)
        {
            meta.instance = ClassRef.from(this._searchConnector, alias);
        }

        this._dbObjects.set(key, meta);
        return key;
    }


    getDbObject(key)
    {
        return this._dbObjects.get(key)?.instance ?? null;
    }


    async next()
    {
        if (!this._searchConnector)
        {
            return null;
        }

        return this._searchConnector.next();
    }


    recordCount()
    {
        if (!this._searchConnector)
        {
            return 0;
        }

        return this._searchConnector.recordCount();
    }


    close()
    {
        if (!this._searchConnector)
        {
            return;
        }

        this._searchConnector.close();
        this._searchConnector = null;

        for (const meta of this._dbObjects.values())
        {
            meta.instance = null;
        }
    }
}
