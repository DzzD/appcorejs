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
import pg from 'pg';

import {
    getProjectRoot,
    parseArgs,
    computeClassPrefix,
    scaffoldUserWorkspace,
    toPascalCase,
    loadTables,
    introspectTable,
    buildFieldDefinition,
    buildClassFieldDeclaration,
    buildAttributeInitialisation,
    buildAccessorMethods
} from './AppCore.helpers.js';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateCoreClass(meta, generationRoot, dryRun)
{
    const { tableName, coreClassName, businessClassName, columns, primaryKeys, dataBaseName, databaseNameRaw, schema } = meta;

    const generatedDir = path.resolve(generationRoot, 'core', 'db', 'models');
    const filePath = path.join(generatedDir, `${coreClassName}.js`);

    const fieldsLines = columns.map((column) => buildFieldDefinition(column)).join(',\n');

    const primaryKeyArray = primaryKeys.map((primaryKey) => `'${primaryKey}'`).join(', ');

    const classFields = columns.map((column) => buildClassFieldDeclaration(column)).join('\n');

    const attributeInitialisation = columns.map((column) => buildAttributeInitialisation(column)).join('\n\n');

    const accessorMethods = columns.map((column) => buildAccessorMethods(column)).join('\n\n');

    const foreignKeyImports = new Set();
    const foreignKeyMethods = [];
    const foreignKeyMethodNames = new Set();

    columns.forEach((column) =>
    {
        if (!column.foreignKey)
        {
            return;
        }

        const referencedTablePascal = toPascalCase(column.foreignKey.referencedTable);
        const referencedClassName = `${dataBaseName}${referencedTablePascal}`;
        let methodName = `get${referencedClassName}`;

        if (foreignKeyMethodNames.has(methodName))
        {
            methodName = `${methodName}By${toPascalCase(column.attrName)}`;
        }

        foreignKeyMethodNames.add(methodName);
        foreignKeyImports.add(referencedClassName);

        const variableName = `${referencedClassName.charAt(0).toLowerCase()}${referencedClassName.slice(1)}`;
        const referencedColumn = column.foreignKey.referencedColumn;

        foreignKeyMethods.push(
            [
                `    async ${methodName}()`,
                '    {',
                `        const ${variableName} = new ${referencedClassName}(this._connectionUid);`,
                `        await ${variableName}.search('\"${referencedColumn}\" = $1', [this.${column.attrName}]);`,
                `        await ${variableName}.next();`,
                `        return ${variableName};`,
                '    }'
            ].join('\n')
        );
    });

    const foreignKeyImportLines = Array.from(foreignKeyImports).sort().map((className) =>
    {
        return `import { ${className} } from '../../../app/db/models/${className}.js';`;
    }).join('\n');

    const foreignKeyMethodsBlock = foreignKeyMethods.join('\n\n');

    const content =
        `// AUTO-GENERATED FILE – NE PAS MODIFIER MANUELLEMENT\n` +
        `// Généré par tools/BuildAppCore.js\n\n` +
        `import { DbObject } from '../../../app/db/DbObject.js';\n` +
        `${foreignKeyImportLines ? `${foreignKeyImportLines}\n` : ''}\n` +
        `export class ${coreClassName} extends DbObject\n` +
        `{\n` +
        `${classFields ? `${classFields}\n\n` : ''}` +
        `    constructor(connectionUid = null)\n` +
        `    {\n` +
        `        super(connectionUid);\n\n` +
        `        this._databaseName = '${databaseNameRaw}';\n` +
        `        this._schema = '${schema}';\n` +
        `        this._tableName = '${tableName}';\n\n` +
        `        this._fields =\n` +
        `        {\n` +
        `${fieldsLines ? `${fieldsLines}\n` : ''}` +
        `        };\n\n` +
        `        this._primaryKeys = [${primaryKeyArray}];\n\n` +
        `${attributeInitialisation ? `${attributeInitialisation}\n` : ''}` +
        `    }\n` +
        `${accessorMethods ? `\n${accessorMethods}\n` : ''}` +
        `${foreignKeyMethodsBlock ? `\n${foreignKeyMethodsBlock}\n` : ''}` +
        `}\n`;

    if (dryRun)
    {
        console.log('[DRY-RUN] Écriture de', filePath);
        console.log(content);
        return;
    }

    await fs.mkdir(generatedDir, { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');
}

async function generateBusinessClass(meta, modelsRoot, dryRun)
{
    const { coreClassName, businessClassName } = meta;

    const filePath = path.join(modelsRoot, `${businessClassName}.js`);

    try
    {
        await fs.access(filePath);
        return;
    }
    catch
    {
    }

    const content =
        `// Classe métier générée une seule fois.\n` +
        `// Vous pouvez la modifier librement, elle ne sera jamais écrasée.\n\n` +
        `import { ${coreClassName} } from '../../../core/db/models/${coreClassName}.js';\n\n` +
        `export class ${businessClassName} extends ${coreClassName}\n` +
        `{\n` +
        `}\n`;

    if (dryRun)
    {
        console.log('[DRY-RUN] Création de', filePath);
        console.log(content);
        return;
    }

    await fs.mkdir(modelsRoot, { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');
}

function createProjectBaseGenerator()
{
    return async function generateProjectBase({ generationRoot, isFrameworkMode, dryRun })
    {
        if (isFrameworkMode)
        {
            console.log('[BuildAppCore] [ProjectBase] Framework mode detected, skipping scaffolding');
            return;
        }

        console.log('[BuildAppCore] [ProjectBase] Synchronising workspace scaffolding');
        await scaffoldUserWorkspace(generationRoot, dryRun);
        console.log('[BuildAppCore] [ProjectBase] Workspace scaffolding completed');
    };
}

function createModelGenerator()
{
    return async function generateModels({ client, schema, classPrefix, databaseName, generationRoot, modelsRoot, dryRun })
    {
        console.log(`[BuildAppCore] [Models] Loading tables for schema "${schema}"`);

        const tables = await loadTables(client, schema);

        for (const tableName of tables)
        {
            console.log(`[BuildAppCore] [Models] Generating models for table "${tableName}"`);
            const meta = await introspectTable(client, schema, tableName, classPrefix, databaseName);
            await generateCoreClass(meta, generationRoot, dryRun);
            await generateBusinessClass(meta, modelsRoot, dryRun);
        }

        console.log('[BuildAppCore] [Models] Model generation completed');
    };
}

function createApiGenerator()
{
    return async function generateApis()
    {
        console.log('[BuildAppCore] [APIs] Generation placeholder – implementation pending');
    };
}

function createFrontGenerator()
{
    return async function generateFront()
    {
        console.log('[BuildAppCore] [Front] Generation placeholder – implementation pending');
    };
}

async function main()
{
    const args = parseArgs(process.argv.slice(2));

    const projectRoot = getProjectRoot();
    const resolvedProjectRoot = path.resolve(projectRoot);
    const resolvedFrameworkRoot = path.resolve(__dirname);
    const resolvedFrameworkParentRoot = path.resolve(__dirname, '..');

    const isFrameworkMode =
        resolvedProjectRoot === resolvedFrameworkRoot ||
        resolvedProjectRoot === resolvedFrameworkParentRoot;

    const generationRoot = isFrameworkMode ? resolvedFrameworkRoot : resolvedProjectRoot;
    const modelsRoot = path.resolve(generationRoot, args.rootPath);

    const generateProjectBase = createProjectBaseGenerator();
    const generateModels = createModelGenerator();
    const generateApis = createApiGenerator();
    const generateFront = createFrontGenerator();

    await generateProjectBase({ generationRoot, isFrameworkMode, dryRun: args.dryRun });

    if (args.nomodel)
    {
        console.log('[AppCore] --nomodel mode: ensured project base then exited before model generation');
        process.exit(0);
    }

    const client = new Client(
    {
        host: args.host,
        port: args.port,
        user: args.user,
        password: args.password,
        database: args.database
    });

    await client.connect();

    try
    {
        const classPrefix = computeClassPrefix(args.prefix, args.database);

        await generateModels(
        {
            client,
            schema: args.schema,
            classPrefix,
            databaseName: args.database,
            generationRoot,
            modelsRoot,
            dryRun: args.dryRun
        });

        await generateApis();
        await generateFront();
        console.log('[BuildAppCore] Generation sequence completed - exiting');
    }
    finally
    {
        await client.end();
    }

    process.exit(0);
}

main().catch((error) =>
{
    console.error('[BuildAppCore] Error:', error);
    process.exit(1);
});