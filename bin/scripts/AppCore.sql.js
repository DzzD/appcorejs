/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import pg from 'pg';

import { Log } from '../../src/app/Log.js';

const { Client } = pg;

export async function withDatabase(configuration, callback)
{
    const client = new Client(
    {
        host: configuration.dbhost,
        port: configuration.dbport,
        user: configuration.dbuser,
        password: configuration.dbpassword,
        database: configuration.dbname
    });

    await client.connect();

    try
    {
        return await callback(client);
    }
    finally
    {
        await client.end();
    }
}

export async function resolveTargetSchemas(client, requestedSchema)
{
    if (!requestedSchema || requestedSchema === 'ALL')
    {
        const result = await client.query(
            `SELECT DISTINCT table_schema
             FROM information_schema.tables
             WHERE table_type = 'BASE TABLE'
               AND table_schema NOT IN ('pg_catalog', 'information_schema')
             ORDER BY table_schema`);

        return result.rows.map((row) => row.table_schema);
    }

    return requestedSchema.split(',').map((schema) => schema.trim()).filter((schema) => schema.length > 0);
}

export async function fetchSchemaTables(client, schema)
{
    const result = await client.query(
        `SELECT table_name
         FROM information_schema.tables
         WHERE table_schema = $1
           AND table_type = 'BASE TABLE'
         ORDER BY table_name`,
        [schema]);

    return result.rows.map((row) => row.table_name);
}

export async function fetchTableColumns(client, schema, table)
{
    const result = await client.query(
        `SELECT column_name, data_type, is_nullable, column_default
         FROM information_schema.columns
         WHERE table_schema = $1
           AND table_name = $2
         ORDER BY ordinal_position`,
        [schema, table]);

    return result.rows;
}

export async function fetchTablePrimaryKeys(client, schema, table)
{
    const result = await client.query(
        `SELECT a.attname AS column_name
         FROM pg_index i
         JOIN pg_class t ON t.oid = i.indrelid
         JOIN pg_namespace n ON n.oid = t.relnamespace
         JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(i.indkey)
         WHERE i.indisprimary
           AND n.nspname = $1
           AND t.relname = $2
         ORDER BY a.attnum`,
        [schema, table]);

    return result.rows.map((row) => row.column_name);
}

export async function fetchTableForeignKeys(client, schema, table)
{
    const result = await client.query(
        `SELECT
             kcu.column_name,
             ccu.table_schema AS foreign_schema,
             ccu.table_name AS foreign_table,
             ccu.column_name AS foreign_column
         FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu
             ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
         JOIN information_schema.constraint_column_usage ccu
             ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
         WHERE tc.constraint_type = 'FOREIGN KEY'
           AND tc.table_schema = $1
           AND tc.table_name = $2
         ORDER BY kcu.ordinal_position`,
        [schema, table]);

    const foreignKeys = {};

    for (const row of result.rows)
    {
        foreignKeys[row.column_name] =
        {
            schema: row.foreign_schema,
            table: row.foreign_table,
            column: row.foreign_column
        };
    }

    return foreignKeys;
}

