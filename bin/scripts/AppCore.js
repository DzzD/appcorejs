/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { Log } from '../../src/app/Log.js';
import { initialiseProject } from './AppCore.project.js';
import { generateModel } from './AppCore.model.js';
import { resolveProjectRoot } from './AppCore.helpers.js';

function parseArguments(rawArgs)
{
    const args =
    {
        model: false,
        dbuser: null,
        dbpassword: null,
        dbport: 5432,
        dbhost: 'localhost',
        dbname: null,
        dbschema: null,
        modelPrefix: null
    };

    for (let index = 0; index < rawArgs.length; index++)
    {
        const current = rawArgs[index];

        if (current === '--model')
        {
            args.model = true;
            continue;
        }

        if (current === '--dbuser')
        {
            args.dbuser = rawArgs[++index] || null;
            continue;
        }

        if (current === '--dbpassword')
        {
            args.dbpassword = rawArgs[++index] || null;
            continue;
        }

        if (current === '--dbport')
        {
            const portValue = rawArgs[++index];
            args.dbport = portValue ? Number(portValue) : 5432;
            continue;
        }

        if (current === '--dbhost')
        {
            args.dbhost = rawArgs[++index] || 'localhost';
            continue;
        }

        if (current === '--dbname')
        {
            args.dbname = rawArgs[++index] || null;
            continue;
        }

        if (current === '--dbschema')
        {
            args.dbschema = rawArgs[++index] || null;
            continue;
        }

        if (current === '--model-prefix')
        {
            args.modelPrefix = rawArgs[++index] || null;
            continue;
        }

        if (current === '--noprefix')
        {
            args.model = true;
            args.modelPrefix = '';
            continue;
        }
    }

    return args;
}

async function main(rawArgs)
{
    const args = parseArguments(rawArgs);
    Log.info('[app-core] Command invoked with arguments:', args);

    await initialiseProject();

    if (args.model)
    {
        if (!args.dbuser || !args.dbpassword)
        {
            Log.error('[app-core] Missing database credentials for model generation');
            process.exit(1);
        }

        if (!args.dbname)
        {
            Log.error('[app-core] Missing database name for model generation');
            process.exit(1);
        }

        const computedSchema = args.dbschema || 'ALL';
        const computedPrefix = args.modelPrefix === null ? args.dbname : args.modelPrefix;

        await generateModel({ ...args, dbschema: computedSchema, modelPrefix: computedPrefix });
    }

    
}

main(process.argv.slice(2));
