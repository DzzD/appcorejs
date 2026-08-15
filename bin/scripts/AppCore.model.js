/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import fs from 'node:fs/promises';
import path from 'node:path';

import { Log } from '../../src/app/Log.js';
import { toPascalCase, toCamelCase, pluralizeName, resolveProjectRoot } from './AppCore.helpers.js';
import { withDatabase, resolveTargetSchemas, fetchSchemaTables, fetchTableColumns, fetchTablePrimaryKeys, fetchTableForeignKeys } from './AppCore.sql.js';

export async function synchroniseModel(configuration)
{
    Log.info('[app-core] Model synchronisation requested');
    // Log.info('[app-core] Database configuration:', configuration);


    configuration.projectRoot = configuration.projectRoot ?? resolveProjectRoot();
    

    if (!configuration.tables || configuration.tables.length === 0)
    {

        const tables = await loadDatabaseMetadata(configuration);
        if (tables.length === 0)
        {
            Log.warn('[app-core] No database tables found, skipping model synchronisation');
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
    const appModelsRoot = resolveProjectModelsRoot(configuration);
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
    const coreModelsRoot = resolveCoreModelsRoot(configuration);
    await fs.mkdir(coreModelsRoot, { recursive: true });

    const tables = configuration.tables ?? [];
    const referencingForeignKeysMap = buildReferencingForeignKeysMap(tables, configuration);

    for (const table of tables)
    {
        const className = `Core${configuration.normalizedPrefix}${toPascalCase(table.name)}`;
        const fileName = `${className}.js`;
        const filePath = path.join(coreModelsRoot, fileName);

        const tableKey = buildTableKey(table.schema, table.name);
        const referencingForeignKeys = referencingForeignKeysMap.get(tableKey) ?? [];

        const finalContent = buildCoreClassContent(className, table, configuration, referencingForeignKeys).replace(/^.*\r?\n/, '');
        await fs.writeFile(filePath, finalContent, 'utf8');
        Log.info(`[app-core] Created Core model class: ${filePath}`);
    }
}


function buildCoreClassContent(className, table, configuration, referencingForeignKeys)
{
    const fields = table.columns ?? [];
    const foreignKeys = table.foreignKeys ?? [];
    const incomingForeignKeys = referencingForeignKeys ?? [];

    const attributes = fields.map((column) => `_${toCamelCase(column.name)}`);
    const snapshots = fields.map((column) => `__${toCamelCase(column.name)}`);
    const schemaName = table.schema ?? (configuration.dbschema === 'ALL' ? '' : configuration.dbschema);

    const relatedImports = foreignKeys
        .filter((foreignKey) => typeof foreignKey.relatedClassName === 'string' && foreignKey.relatedClassName.length > 0)
        .map((foreignKey) => foreignKey.relatedClassName);
    const incomingImports = incomingForeignKeys
        .filter((incomingForeignKey) => typeof incomingForeignKey.referencingClassName === 'string' && incomingForeignKey.referencingClassName.length > 0)
        .map((incomingForeignKey) => incomingForeignKey.referencingClassName);
    const uniqueImports = Array.from(new Set([...relatedImports, ...incomingImports]));
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
        const defaultValueLiteral = JSON.stringify(column.defaultValue ?? null);
        const foreignKeyLiteral = JSON.stringify(column.foreignKey ?? null);

        const lines =
    `           ${columnName}:
                {
                    columnName: ${JSON.stringify(columnName)},
                    attributeName: ${JSON.stringify(attribute)},
                    isPrimaryKey: ${isPrimaryKey},
                    dataType: ${JSON.stringify(dataType)},
                    isNullable: ${isNullable},
                    defaultValue: ${defaultValueLiteral},
                    foreignKey: ${foreignKeyLiteral}
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

    const methodNameUsage = new Map();

    function buildUniqueMethodName(baseName)
    {
        const usageCount = methodNameUsage.get(baseName) ?? 0;
        const nextCount = usageCount + 1;
        methodNameUsage.set(baseName, nextCount);

        if (nextCount === 1)
        {
            return baseName;
        }

        return `${baseName}${nextCount}`;
    }

    const foreignGetters = foreignKeys.map((foreignKey) =>
    {
        const relatedClassBase = `${configuration.normalizedPrefix}${toPascalCase(foreignKey.table)}`;
        const relatedClassName = relatedClassBase.length > 0 ? relatedClassBase : toPascalCase(foreignKey.table);
        const baseMethodName = `get${relatedClassName}`;
        const methodName = buildUniqueMethodName(baseMethodName);
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

    const inverseForeignGetters = incomingForeignKeys.map((incomingForeignKey) =>
    {
        const pluralClassName = pluralizeName(incomingForeignKey.referencingClassName);
        const baseMethodName = `get${pluralClassName}`;
        const methodName = buildUniqueMethodName(baseMethodName);

        const collectionVariableName = pluralizeName(toCamelCase(incomingForeignKey.referencingTable));
        const attributeName = toCamelCase(incomingForeignKey.foreignColumn);

        return `    async ${methodName}()
    {
        const ${collectionVariableName} = new ${incomingForeignKey.referencingClassName}(this._connectionUid);
        const found = await ${collectionVariableName}.search('\"${incomingForeignKey.localColumn}\" = $1', [this.${attributeName}]);
        if(!found)
        {
            return null;
        }        
        return ${collectionVariableName};
    }`;
    });

    const methods = [...getterSetterBlocks, ...foreignGetters, ...inverseForeignGetters];
    const methodsBlock = methods.length > 0 ? `${methods.join('\n\n')}\n` : '';

    const primaryKeys = table.primaryKeys ?? [];
    const primaryKeysBlock = primaryKeys.length > 0 ? `        this._primaryKeys = [${primaryKeys.map((pk) => `'${pk}'`).join(', ')}];\n\n` : '';

    return `
/**
 * AppCoreJS Framework
 * GENERATED PROJECT CORE MODEL
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * Generated from the project database schema by app-core.
 * This file may be regenerated at any time.
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
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

    return withDatabase(configuration, async (client) =>
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
    });
}


function buildReferencingForeignKeysMap(tables, configuration)
{
    const referencingForeignKeysMap = new Map();

    for (const table of tables)
    {
        const referencingClassBase = `${configuration.normalizedPrefix}${toPascalCase(table.name)}`;
        const referencingClassName = referencingClassBase.length > 0 ? referencingClassBase : toPascalCase(table.name);
        const foreignKeys = table.foreignKeys ?? [];

        for (const foreignKey of foreignKeys)
        {
            const targetKey = buildTableKey(foreignKey.schema, foreignKey.table);
            if (!referencingForeignKeysMap.has(targetKey))
            {
                referencingForeignKeysMap.set(targetKey, []);
            }

            const entries = referencingForeignKeysMap.get(targetKey);
            entries.push(
            {
                referencingSchema: table.schema,
                referencingTable: table.name,
                referencingClassName,
                localColumn: foreignKey.localColumn,
                foreignColumn: foreignKey.column
            });
        }
    }

    for (const entries of referencingForeignKeysMap.values())
    {
        entries.sort((left, right) =>
        {
            if (left.referencingClassName === right.referencingClassName)
            {
                return left.localColumn.localeCompare(right.localColumn);
            }

            return left.referencingClassName.localeCompare(right.referencingClassName);
        });
    }

    return referencingForeignKeysMap;
}


function buildTableKey(schema, table)
{
    const normalizedSchema = schema ?? '';
    return `${normalizedSchema}.${table}`;
}

function resolveProjectModelsRoot(configuration)
{
    return path.resolve(configuration.projectRoot || process.cwd(), 'app', 'db', 'models');
}

function resolveCoreModelsRoot(configuration)
{
    return path.resolve(configuration.projectRoot || process.cwd(), 'core', 'db', 'models');
}
