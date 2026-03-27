/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import fs from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { Log } from '../../src/app/Log.js';
import { copyDirectory, resolveProjectRoot } from './AppCore.helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function synchroniseFrontend(frameworkRoot = null, projectRoot = null)
{
    Log.info('[app-core] Frontend synchronisation...');

    const resolvedFrameworkRoot = frameworkRoot ?? path.resolve(__dirname, '..', '..');
    const resolvedProjectRoot = projectRoot ?? resolveProjectRoot();
    const sourcePublic = path.join(resolvedFrameworkRoot, 'src', 'public');
    const targetPublic = path.resolve(resolvedProjectRoot, 'public');

    await copyDirectory(sourcePublic, targetPublic, false);

    const frameworkIndexPath = path.join(resolvedFrameworkRoot, 'src', 'server.js');
    const targetIndexPath = path.resolve(resolvedProjectRoot, 'server.js');

    try
    {
        await fs.copyFile(frameworkIndexPath, targetIndexPath, fsConstants.COPYFILE_EXCL);
        Log.info(`[app-core] Copied frontend entry: ${targetIndexPath}`);
    }
    catch (error)
    {
        if (error && error.code === 'EEXIST')
        {
            Log.info(`[app-core] Preserved existing frontend entry: ${targetIndexPath}`);
        }
        else
        {
            throw error;
        }
    }

    Log.info('[app-core] Frontend synchronisation completed');
}
