/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { Error } from '../../app/Error.js';
import { Log } from '../../app/Log.js';
import { DbManager } from '../../app/db/DbManager.js';

export class CoreDbConnector
{
    _client;
    _rowBuffer;
    _rowBufferIndex;
    _links;

    constructor()
    {
        this.databaseName = null;
        this._connectionUid = null;
        this._client = null;
        this._rowBuffer = [];
        this._rowBufferIndex = 0;
        this._links = new Map();
    }


    async _ensureClient()
    {
        if (!this._client)
        {
            this._client = await DbManager.getClient(this.databaseName, this._connectionUid);
        }
    }
    

	close()
	{
		if (this._client)
		{
            DbManager.releaseConnection(this._connectionUid);
			this._client = null;
		}
	}


    async beginTransaction()
    {
        await this._ensureClient();

        try
        {
            await this._client.query('BEGIN');
        }
        catch (error)
        {
            throw new Error('BEGIN transaction failed', error, { databaseName: this.databaseName });
        }
    }


    async commit()
    {
        await this._ensureClient();

        try
        {
            await this._client.query('COMMIT');
        }
        catch (error)
        {
            throw new Error('COMMIT transaction failed', error, { databaseName: this.databaseName });
        }
    }


    async rollback()
    {
        await this._ensureClient();

        try
        {
            await this._client.query('ROLLBACK');
        }
        catch (error)
        {
            throw new Error('ROLLBACK transaction failed', error, { databaseName: this.databaseName });
        }
    }


    async query(sql, params = [])
    {
        await this._ensureClient();

        Log.debug('[CoreDbConnector][query]', this.databaseName, sql, params);

        this._rowBuffer = [];
        this._rowBufferIndex = -1;
        try
        {
            const result = await this._client.query(sql, params);
            this._rowBuffer = result && Array.isArray(result.rows) ? result.rows : [];
            this._rowBufferIndex = -1;
            return this;
        }
        catch (error)
        {
            throw new Error('Query failed', error, { sql, params, databaseName: this.databaseName });
        }
    }


    async next()
    {
        let row = null;

        if (this._rowBuffer.length > 0 && this._rowBufferIndex < this._rowBuffer.length)
        {
            this._rowBufferIndex += 1;
            row = this._rowBuffer[this._rowBufferIndex];  
        }

        for (const [obj, alias] of this._links)
        {
            if(!alias)
            {
                obj.fromRow(row);
            }
            else
            {
                obj.fromRow(row?.[alias] ?? null);
            }
        }

        return row;
    }


    recordCount()
    {
        if (!this._rowBuffer)
        {
            return 0;
        }

        return this._rowBuffer.length;
    }

    linkTo(obj, alias)
    {
        this._links.set(obj, alias);
    }
}
