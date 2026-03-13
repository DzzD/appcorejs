import fs from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

import { Log } from '../../src/app/Log.js';
import { toPascalCase, toCamelCase } from './AppCore.helpers.js';

const { Client } = pg;

export async function generateModel(configuration)
{
    Log.info('[app-core] Model generation requested');
    Log.info('[app-core] Database configuration:', configuration);

    const projectRoot = resolveProjectRoot();
    configuration.projectRoot = projectRoot;

    if (!configuration.tables || configuration.tables.length === 0)
    {

        const tables = await loadDatabaseMetadata(configuration);
        if (tables.length === 0)
        {
            Log.warn('[app-core] No database tables found, skipping model generation');
            return;
        }

        configuration.tables = tables;
    }

    configuration.normalizedPrefix = configuration.modelPrefix ? toPascalCase(configuration.modelPrefix) : '';

    await generateAppModels(configuration);
    await generateCoreModels(configuration);
}

async function generateAppModels(configuration)
{
    const appModelsRoot = path.resolve(configuration.projectRoot || process.cwd(), 'app', 'db', 'models');
    await fs.mkdir(appModelsRoot, { recursive: true });

    const tables = configuration.tables ?? [];

    for (const table of tables)
    {
        const className = `${configuration.normalizedPrefix}${toPascalCase(table.name)}`;
        const fileName = `${className}.js`;
        const filePath = path.join(appModelsRoot, fileName);

        try
        {
            await fs.access(filePath);
            Log.info(`[app-core] Skipped existing App model class: ${filePath}`);
            continue;
        }
        catch
        {
        }

        const coreClassName = `Core${className}`;
        const content = `
/*
 * ONE-SHOT GENERATED FILE
 *
 * This file is generated once and can be freely modified.
 * You may add your own rules, methods, or overrides here.
 *
 * If this file is deleted, it can be generated again by re-running app-core.
 */

import { ${coreClassName} } from '../../../core/db/models/${coreClassName}.js';

export class ${className} extends ${coreClassName}
{
}
`;

        await fs.writeFile(filePath, content.replace(/^.*\r?\n/, ''), 'utf8');
        Log.info(`[app-core] Created App model class: ${filePath}`);
    }
}

async function generateCoreModels(configuration)
{
    const coreModelsRoot = path.resolve(configuration.projectRoot || process.cwd(), 'core', 'db', 'models');
    await fs.mkdir(coreModelsRoot, { recursive: true });

    const tables = configuration.tables ?? [];

    for (const table of tables)
    {
        const className = `Core${configuration.normalizedPrefix}${toPascalCase(table.name)}`;
        const fileName = `${className}.js`;
        const filePath = path.join(coreModelsRoot, fileName);

        const content = buildCoreClassContent(className, table, configuration);
        await fs.writeFile(filePath, content.replace(/^.*\r?\n/, ''), 'utf8');
        Log.info(`[app-core] Created Core model class: ${filePath}`);
    }
}


function buildCoreClassContent(className, table, configuration)
{
    const fields = table.columns ?? [];
    const foreignKeys = table.foreignKeys ?? [];

    const attributes = fields.map((column) => `_${toCamelCase(column.name)}`);
    const snapshots = fields.map((column) => `__${toCamelCase(column.name)}`);
    const schemaName = table.schema ?? (configuration.dbschema === 'ALL' ? '' : configuration.dbschema);

    const relatedImports = foreignKeys
        .filter((foreignKey) => typeof foreignKey.relatedClassName === 'string' && foreignKey.relatedClassName.length > 0)
        .map((foreignKey) => foreignKey.relatedClassName);
    const uniqueImports = Array.from(new Set(relatedImports));
    const importLines = [
        "import { DbObject } from '../../../app/db/DbObject.js';",
        ...uniqueImports.map((relatedClassName) => `import { ${relatedClassName} } from '../../../app/db/models/${relatedClassName}.js';`)
    ].join('\n');

    const propertyLines = [];
    propertyLines.push(...attributes.map((attribute) => `    ${attribute};`));
    propertyLines.push(...snapshots.map((snapshot) => `    ${snapshot};`));
    const propertiesBlock = propertyLines.length > 0 ? `${propertyLines.join('\n')}\n\n` : '';

    const assignmentLines = fields.map((column, index) =>
    {
        const attribute = attributes[index];
        const snapshot = snapshots[index];
        return `        this.${attribute} = null;\n        this.${snapshot} = null;`;
    });
    const assignmentsBlock = assignmentLines.length > 0 ? `${assignmentLines.join('\n\n')}\n` : '';

    const fieldsEntries = fields.map((column, index) =>
    {
        const attribute = attributes[index];
        const columnName = column.name;
        const isPrimaryKey = column.isPrimaryKey ?? (table.primaryKeys ?? []).includes(columnName);
        const dataType = column.dataType ?? '';
        const isNullable = column.isNullable ?? true;
        const defaultValue = column.defaultValue ?? null;
        const foreignKeyValue = column.foreignKey === null ? 'null' : `'${column.foreignKey}'`;

        const lines =
`           ${columnName}:
            {
                columnName: '${columnName}',
                attributeName: '${attribute}',
                isPrimaryKey: ${isPrimaryKey},
                dataType: '${dataType}',
                isNullable: ${isNullable},
                defaultValue: ${defaultValue === null ? 'null' : `'${defaultValue}'`},
                foreignKey: ${foreignKeyValue}
            }`;
        return lines;
    });

    const fieldsBlock = fieldsEntries.length > 0 ?
`        this._fields =
        {
${fieldsEntries.join(',\n')}
        };

` : `        this._fields = {};

`;

    const getterSetterBlocks = fields.map((column, index) =>
    {
        const camelName = column.accessorName;
        const attribute = attributes[index];
        return `    get ${camelName}()
    {
        return this.${attribute};
    }

    set ${camelName}(${camelName})
    {
        this.${attribute} = ${camelName};
    }`;
    });

    const foreignGetters = foreignKeys.map((foreignKey) =>
    {
        const relatedClassBase = `${configuration.normalizedPrefix}${toPascalCase(foreignKey.table)}`;
        const relatedClassName = relatedClassBase.length > 0 ? relatedClassBase : toPascalCase(foreignKey.table);
        const methodName = `get${relatedClassName}`;
        const attributeName = toCamelCase(foreignKey.localColumn);
        const relatedVariableName = toCamelCase(foreignKey.table);

        return `    async ${methodName}()
    {
        const ${relatedVariableName} = new ${relatedClassName}(this._connectionUid);
        const found = await ${relatedVariableName}.search('\"${foreignKey.column}\" = $1', [this.${attributeName}]);
        if(!found)
        {
            return null;
        }
        await ${relatedVariableName}.next();
        return ${relatedVariableName};
    }`;
    });

    const methodsBlock = [...getterSetterBlocks, ...foreignGetters].length > 0 ? `${[...getterSetterBlocks, ...foreignGetters].join('\n\n')}\n` : '';

    const primaryKeys = table.primaryKeys ?? [];
    const primaryKeysBlock = primaryKeys.length > 0 ? `        this._primaryKeys = [${primaryKeys.map((pk) => `'${pk}'`).join(', ')}];\n\n` : '';

    return `
/*
 * AUTO-GENERATED FILE - DO NOT EDIT
 * This file is managed by app-core and may be regenerated at any time.
 */

${importLines}

export class ${className} extends DbObject
{
${propertiesBlock}
    constructor(connectionUid = null)
    {
        super(connectionUid);

        this._databaseName = '${configuration.dbname}';
        this._schema = '${schemaName}';
        this._tableName = '${table.name}';

${fieldsBlock}
${primaryKeysBlock}
${assignmentsBlock}
    }

${methodsBlock}
}`
}


async function loadDatabaseMetadata(configuration)
{
    if (!configuration.dbuser || !configuration.dbpassword || !configuration.dbname)
    {
        Log.warn('[app-core] Missing credentials for database introspection');
        return [];
    }

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
        const schemas = await resolveTargetSchemas(client, configuration.dbschema);
        const tables = [];

        for (const schema of schemas)
        {
            const schemaTables = await fetchSchemaTables(client, schema);
            const normalizedPrefix = configuration.modelPrefix ? toPascalCase(configuration.modelPrefix) : '';

            for (const tableName of schemaTables)
            {
                const columnsData = await fetchTableColumns(client, schema, tableName);
                const primaryKeys = await fetchTablePrimaryKeys(client, schema, tableName);
                const foreignKeys = await fetchTableForeignKeys(client, schema, tableName);

                const columns = columnsData.map((column) =>
                {
                    const columnName = column.column_name;
                    const accessorName = toCamelCase(columnName);
                    const isPrimaryKey = primaryKeys.includes(columnName);
                    const foreignKey = foreignKeys[columnName] ?? null;

                    return {
                        name: columnName,
                        accessorName,
                        dataType: column.data_type,
                        isNullable: column.is_nullable === 'YES',
                        defaultValue: column.column_default ?? null,
                        isPrimaryKey,
                        foreignKey: foreignKey ? `${foreignKey.schema}.${foreignKey.table}.${foreignKey.column}` : null
                    };
                });

                const tableForeignKeys = Object.entries(foreignKeys).map(([columnName, foreignKey]) =>
                {
                    const relatedClassBase = `${normalizedPrefix}${toPascalCase(foreignKey.table)}`;
                    const relatedClassName = relatedClassBase.length > 0 ? relatedClassBase : toPascalCase(foreignKey.table);

                    return {
                        localColumn: columnName,
                        schema: foreignKey.schema,
                        table: foreignKey.table,
                        column: foreignKey.column,
                        relatedClassName
                    };
                });

                tables.push(
                {
                    name: tableName,
                    schema,
                    columns,
                    primaryKeys,
                    foreignKeys: tableForeignKeys
                });
            }
        }

        return tables;
    }
    finally
    {
        await client.end();
    }
}
function resolveProjectRoot()
{
    return process.cwd();
}


async function resolveTargetSchemas(client, requestedSchema)
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


async function fetchSchemaTables(client, schema)
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


async function fetchTableColumns(client, schema, table)
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


async function fetchTablePrimaryKeys(client, schema, table)
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


async function fetchTableForeignKeys(client, schema, table)
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
