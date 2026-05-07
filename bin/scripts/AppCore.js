/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { Log } from '../../src/app/Log.js';
import { synchroniseModel } from './AppCore.model.js';
import { resolveProjectRoot } from './AppCore.helpers.js';
import { synchroniseFrontend } from './AppCore.front.js';
import { synchroniseBackend } from './AppCore.back.js';
import { synchroniseServer } from './AppCore.server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArguments(rawArgs)
{
    const args =
    {
        project: null,
        model: false,
        front: false,
        intro: false,
        ext: false,
        back: false,
        server: false,
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

        if (current === '--project')
        {
            args.project = rawArgs[++index] || null;
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

        if (current === '--model-noprefix')
        {
            args.model = true;
            args.modelPrefix = '';
            continue;
        }

        if (current === '--front')
        {
            args.front = true;
            continue;
        }

        if (current === '--intro')
        {
            args.intro = true;
            continue;
        }

        if (current === '--ext')
        {
            args.ext = true;
            continue;
        }

        if (current === '--back')
        {
            args.back = true;
            continue;
        }

        if (current === '--server')
        {
            args.server = true;
            continue;
        }
    }

    if (args.model)
    {
        args.back = true;
    }

    if (args.server)
    {
        args.back = true;
    }

    if (args.intro)
    {
        args.ext = true;
    }

    return args;
}

function printUsage()
{
    console.info(`app-core options

--back      generate backend files (core, app, <project>/db)
--front     generate front files (eg <project>/public folder)
--intro     generate intro frontend files (<project>/public/intro)
--ext       generate ext frontend files (<project>/public/ext)
--server    generate project server files (server.js and <project>/server)
--model     generate model files
            depend on --dbuser     : mandatory db user
                     --dbpassword  : mandatory db password
                     --dbname      : mandatory db name
--dbhost    optional db host (default: localhost)
--dbport    optional db port (default: 5432)
--dbschema  optional schema (default: ALL)
--model-prefix optional model prefix (default: database name from --dbname when not provided and without --model-noprefix)
--model-noprefix generate model files without prefix (overrides default database-name prefix)
--project   mandatory project/module name

Dependencies:
--model implies --back
--server implies --back
--intro implies --ext
--intro requires --front
--ext requires --front`);
}

function exitWithUsage(errorMessage)
{
    if (errorMessage)
    {
        Log.error(errorMessage);
    }

    printUsage();
    process.exit(1);
}

async function main(rawArgs)
{
    if (rawArgs.length === 0)
    {
        exitWithUsage('No option provided');
    }

    const args = parseArguments(rawArgs);

    if (!args.front)
    {
        if (args.intro)
        {
            exitWithUsage('Invalid option: --intro requires --front');
        }

        if (args.ext)
        {
            exitWithUsage('Invalid option: --ext requires --front');
        }
    }

    if (!args.project)
    {
        exitWithUsage('Missing required option: --project <name>');
    }

    if (args.model)
    {
        if (!args.dbuser)
        {
            exitWithUsage('Missing required option for --model: --dbuser <user>');
        }

        if (!args.dbpassword)
        {
            exitWithUsage('Missing required option for --model: --dbpassword <password>');
        }

        if (!args.dbname)
        {
            exitWithUsage('Missing required option for --model: --dbname <name>');
        }
    }

    const frameworkRoot = path.resolve(__dirname, '..', '..');
    const projectRoot = resolveProjectRoot();

    if (args.back)
    {
        await synchroniseBackend(frameworkRoot, projectRoot, args.project);
    }

    if (args.front)
    {
        await synchroniseFrontend(frameworkRoot, projectRoot, args.project,
        {
            intro: args.intro,
            ext: args.ext
        });
    }

    if (args.server)
    {
        await synchroniseServer(frameworkRoot, projectRoot, args.project);
    }

    if (args.model)
    {
        const computedSchema = args.dbschema || 'ALL';
        const computedPrefix = args.modelPrefix === null ? args.dbname : args.modelPrefix;

        await synchroniseModel(
        {
            ...args,
            projectRoot,
            projectName: args.project,
            dbschema: computedSchema,
            modelPrefix: computedPrefix
        });
    }
}

main(process.argv.slice(2));
