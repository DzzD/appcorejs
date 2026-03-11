/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getProjectRoot()
{
    const init = process.env.INIT_CWD;

    if (init && typeof init === 'string' && init.length > 0)
    {
        try
        {
            return path.resolve(init);
        }
        catch
        {
        }
    }

    return process.cwd();
}

function parseArgs(argv)
{
    const args =
    {
        host: 'localhost',
        port: 5432,
        user: null,
        password: null,
        database: null,
        schema: 'public',
        rootPath: './app/db/models',
        dryRun: false,
        prefix: null,
        nomodel: false
    };

    const map =
    {
        '--host': 'host',
        '-h': 'host',
        '--port': 'port',
        '-p': 'port',
        '--user': 'user',
        '-u': 'user',
        '--password': 'password',
        '-pwd': 'password',
        '--database': 'database',
        '-d': 'database',
        '--schema': 'schema',
        '-s': 'schema',
        '--rootPath': 'rootPath',
        '-r': 'rootPath',
        '--dry-run': 'dryRun',
        '-dr': 'dryRun',
        '--prefix': 'prefix',
        '-px': 'prefix',
        '--nomodel': 'nomodel',
        '--no-model': 'nomodel',
        '-nm': 'nomodel'
    };

    const booleanOptions =
    {
        dryRun: true,
        nomodel: true
    };
for (let i = 0; i < argv.length; i++)
    {
        const key = argv[i];

        if (!Object.prototype.hasOwnProperty.call(map, key))
        {
            continue;
        }

        const name = map[key];

        if (booleanOptions[name])
        {
            args[name] = true;
            continue;
        }

        const value = argv[i + 1];

        if (value === undefined)
        {
            throw new Error(`Option ${key} attend une valeur`);
        }

        args[name] = name === 'port' ? Number(value) : value;
        i++;
    }

    if (!args.nomodel)
    {
        if (!args.user || !args.password || !args.database)
        {
            throw new Error('Paramètres obligatoires manquants : --user, --password, --database');
        }
    }

    return args;
}

async function resolveExistingDirectory(...candidatePaths)
{
    for (const directoryPath of candidatePaths)
    {
        try
        {
            const stats = await fs.stat(directoryPath);

            if (stats.isDirectory())
            {
                return directoryPath;
            }
        }
        catch
        {
        }
    }

    return null;
}

async function directoryExists(directoryPath)
{
    try
    {
        const stats = await fs.stat(directoryPath);
        return stats.isDirectory();
    }
    catch
    {
        return false;
    }
}

function normalizeIdentifier(text)
{
    return String(text).replace(/-/g, '_');
}

function toPascalCase(text)
{
    return normalizeIdentifier(text)
        .split(/[_\s]+/)
        .filter((segment) => segment.length > 0)
        .map((segment) =>
        {
            const lower = segment.toLowerCase();
            return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join('');
}

function computeClassPrefix(prefixOption, databaseName)
{
    if (prefixOption === null || prefixOption === undefined)
    {
        return toPascalCase(databaseName);
    }

    const normalizedOption = String(prefixOption).trim();

    if (normalizedOption.length === 0)
    {
        return '';
    }

    if (normalizedOption.toLowerCase() === 'no-prefix')
    {
        return '';
    }

    return toPascalCase(normalizedOption);
}

async function ensureDir(dirPath)
{
    await fs.mkdir(dirPath, { recursive: true });
}

async function copyDirRecursive(srcRoot, dstRoot, { overwrite = false, dryRun = false, skipModelDirs = false, sourceRootBase = null } = {})
{
    const resolvedSourceRoot = path.resolve(srcRoot);
    const resolvedDestinationRoot = path.resolve(dstRoot);
    const normalizedBaseRoot = sourceRootBase ? path.resolve(sourceRootBase) : resolvedSourceRoot;

    if (resolvedSourceRoot === resolvedDestinationRoot)
    {
        console.log(`[AppCore] Skipped copy because source and destination are the same: ${resolvedSourceRoot}`);
        return;
    }

    const entries = await fs.readdir(srcRoot, { withFileTypes: true });
    await ensureDir(dstRoot);

    for (const entry of entries)
    {
        const srcPath = path.join(srcRoot, entry.name);
        const dstPath = path.join(dstRoot, entry.name);

        if (entry.isDirectory())
        {
            if (skipModelDirs)
            {
                const relativePath = path.relative(normalizedBaseRoot, path.resolve(srcPath)).split(path.sep);
                const hasDb = relativePath.includes('db');
                const hasModels = relativePath.includes('models');

                if (hasDb && hasModels && relativePath.indexOf('db') < relativePath.indexOf('models'))
                {
                    console.log(`[AppCore] Skipped models directory ${srcPath}`);
                    continue;
                }
            }

            await copyDirRecursive(srcPath, dstPath, { overwrite, dryRun, skipModelDirs, sourceRootBase: normalizedBaseRoot });
            continue;
        }

        if (!overwrite)
        {
            try
            {
                await fs.access(dstPath);
                console.log(`[AppCore] Skipped existing ${dstPath}`);
                continue;
            }
            catch
            {
            }
        }

        if (dryRun)
        {
            console.log(`[DRY-RUN] Copy ${srcPath} -> ${dstPath}`);
        }
        else
        {
            await ensureDir(path.dirname(dstPath));
            await fs.copyFile(srcPath, dstPath);
            console.log(`[AppCore] Copied ${srcPath} -> ${dstPath}`);
        }
    }
}

async function scaffoldUserWorkspace(projectRoot, dryRun = false)
{
    const frameworkRoot = path.resolve(__dirname, '..', '..');

    const coreSrc = await resolveExistingDirectory(
        path.resolve(frameworkRoot, 'src', 'core'),
        path.resolve(frameworkRoot, 'core')
    );
    const appSrc = await resolveExistingDirectory(
        path.resolve(frameworkRoot, 'src', 'app'),
        path.resolve(frameworkRoot, 'app')
    );

    const projectHasSrc = await directoryExists(path.resolve(projectRoot, 'src'));
    const coreDst = projectHasSrc ? path.resolve(projectRoot, 'src', 'core') : path.resolve(projectRoot, 'core');
    const appDst = projectHasSrc ? path.resolve(projectRoot, 'src', 'app') : path.resolve(projectRoot, 'app');

    if (coreSrc)
    {
        await copyDirRecursive(coreSrc, coreDst, { overwrite: true, dryRun, skipModelDirs: true, sourceRootBase: coreSrc });
    }
    else
    {
        console.warn('[AppCore] Core template directory not found; skipping core synchronisation');
    }

    if (appSrc)
    {
        await copyDirRecursive(appSrc, appDst, { overwrite: false, dryRun, skipModelDirs: true, sourceRootBase: appSrc });
    }
    else
    {
        console.warn('[AppCore] App template directory not found; skipping app synchronisation');
    }
}

function toCamelCase(text)
{
    const parts = normalizeIdentifier(text)
        .split(/[_\s]+/)
        .filter((segment) => segment.length > 0);

    if (parts.length === 0)
    {
        return text;
    }

    const first = parts[0].toLowerCase();
    const rest = parts.slice(1).map((segment) =>
    {
        const lower = segment.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    });

    return [first, ...rest].join('');
}

function escapeString(value)
{
    return String(value).replace(/'/g, "\\'");
}

function getMutableAttributeName(attributeBase)
{
    return '_' + attributeBase;
}

function getSnapshotAttributeName(attributeBase)
{
    return '__' + attributeBase;
}

function buildFieldDefinition(column)
{
    const attributeName = getMutableAttributeName(column.attrName);
    const defaultValue = column.defaultValue === null ? 'null' : `'${escapeString(column.defaultValue)}'`;

    if (column.foreignKey)
    {
        return [
            `        ${column.attrName}:`,
            '        {',
            `            columnName: '${column.columnName}',`,
            `            attributeName: '${attributeName}',`,
            `            isPrimaryKey: ${column.isPrimaryKey ? 'true' : 'false'},`,
            `            dataType: '${column.dataType}',`,
            `            isNullable: ${column.isNullable ? 'true' : 'false'},`,
            `            defaultValue: ${defaultValue},`,
            '            foreignKey: {',
            `                constraintName: '${escapeString(column.foreignKey.constraintName)}',`,
            `                referencedTable: '${escapeString(column.foreignKey.referencedTable)}',`,
            `                referencedColumn: '${escapeString(column.foreignKey.referencedColumn)}'`,
            '            }',
            '        }'
        ].join('\n');
    }

    return [
        `        ${column.attrName}:`,
        '        {',
        `            columnName: '${column.columnName}',`,
        `            attributeName: '${attributeName}',`,
        `            isPrimaryKey: ${column.isPrimaryKey ? 'true' : 'false'},`,
        `            dataType: '${column.dataType}',`,
        `            isNullable: ${column.isNullable ? 'true' : 'false'},`,
        `            defaultValue: ${defaultValue},`,
        '            foreignKey: null',
        '        }'
    ].join('\n');
}

function buildClassFieldDeclaration(column)
{
    const mutableAttributeName = getMutableAttributeName(column.attrName);
    const snapshotAttributeName = getSnapshotAttributeName(column.attrName);

    return [
        `    ${mutableAttributeName};`,
        `    ${snapshotAttributeName};`
    ].join('\n');
}

function buildAttributeInitialisation(column)
{
    const mutableAttributeName = getMutableAttributeName(column.attrName);
    const snapshotAttributeName = getSnapshotAttributeName(column.attrName);

    return [
        `        this.${mutableAttributeName} = null;`,
        `        this.${snapshotAttributeName} = null;`
    ].join('\n');
}

function buildAccessorMethods(column)
{
    const methodSuffix = toCamelCase(column.columnName);
    const mutableAttributeName = getMutableAttributeName(column.attrName);
    const parameterName = column.attrName;

    return [
        `    get ${methodSuffix}()`,
        '    {',
        `        return this.${mutableAttributeName};`,
        '    }',
        '',
        `    set ${methodSuffix}(${parameterName})`,
        '    {',
        `        this.${mutableAttributeName} = ${parameterName};`,
        '    }'
    ].join('\n');
}

async function loadTables(client, schema)
{
    const sql =
        `SELECT table_name
         FROM information_schema.tables
         WHERE table_schema = $1
           AND table_type = 'BASE TABLE'
         ORDER BY table_name`;

    const result = await client.query(sql, [schema]);

    return result.rows.map((row) => row.table_name);
}

async function introspectTable(client, schema, tableName, dataBaseName, databaseNameRaw)
{
    const columnsSql =
        `SELECT
           c.column_name,
           c.data_type,
           c.is_nullable,
           c.column_default
         FROM information_schema.columns c
         WHERE c.table_schema = $1
           AND c.table_name = $2
         ORDER BY c.ordinal_position`;

    const pkSql =
        `SELECT
           a.attname AS column_name
         FROM pg_index i
         JOIN pg_class t ON t.oid = i.indrelid
         JOIN pg_namespace n ON n.oid = t.relnamespace
         JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(i.indkey)
         WHERE i.indisprimary
           AND n.nspname = $1
           AND t.relname = $2
         ORDER BY a.attnum`;

    const fkSql =
        `SELECT
           kcu.column_name,
           ccu.table_name AS foreign_table_name,
           ccu.column_name AS foreign_column_name,
           tc.constraint_name
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
         ORDER BY kcu.ordinal_position`;

    const [columnsResult, primaryKeysResult, foreignKeysResult] = await Promise.all(
    [
        client.query(columnsSql, [schema, tableName]),
        client.query(pkSql, [schema, tableName]),
        client.query(fkSql, [schema, tableName])
    ]);

    const primaryKeyColumns = primaryKeysResult.rows.map((row) => row.column_name);
    const foreignKeys = {};

    foreignKeysResult.rows.forEach((row) =>
    {
        foreignKeys[row.column_name] =
        {
            constraintName: row.constraint_name,
            referencedTable: row.foreign_table_name,
            referencedColumn: row.foreign_column_name
        };
    });

    const tableBaseName = toPascalCase(tableName);
    const baseName = dataBaseName + tableBaseName;
    const coreClassName = 'Core' + baseName;
    const businessClassName = baseName;

    const columns = columnsResult.rows.map((column) =>
    {
        const attributeName = toCamelCase(column.column_name);

        return {
            columnName: column.column_name,
            attrName: attributeName,
            dataType: column.data_type,
            isNullable: column.is_nullable === 'YES',
            defaultValue: column.column_default,
            isPrimaryKey: primaryKeyColumns.includes(column.column_name),
            foreignKey: foreignKeys[column.column_name] || null
        };
    });

    return {
        schema,
        tableName,
        dataBaseName,
        databaseNameRaw,
        coreClassName,
        businessClassName,
        columns,
        primaryKeys: primaryKeyColumns
    };
}

export {
    getProjectRoot,
    parseArgs,
    resolveExistingDirectory,
    directoryExists,
    normalizeIdentifier,
    toPascalCase,
    computeClassPrefix,
    ensureDir,
    copyDirRecursive,
    scaffoldUserWorkspace,
    toCamelCase,
    loadTables,
    introspectTable,
    buildFieldDefinition,
    buildClassFieldDeclaration,
    buildAttributeInitialisation,
    buildAccessorMethods
};
