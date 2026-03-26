/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import fs from 'node:fs/promises';
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

    const frameworkIndexPath = path.join(resolvedFrameworkRoot, 'src', 'index.js');
    const targetIndexPath = path.resolve(resolvedProjectRoot, 'index.js');

    let frameworkIndexExists = false;

    try
    {
        await fs.access(frameworkIndexPath);
        frameworkIndexExists = true;
    }
    catch
    {
        Log.warn('[app-core] Frontend index template not found, skipping index.js copy');
    }

    if (frameworkIndexExists)
    {
        let destinationExists = false;

        try
        {
            await fs.access(targetIndexPath);
            destinationExists = true;
        }
        catch
        {
        }

        if (!destinationExists)
        {
            await fs.copyFile(frameworkIndexPath, targetIndexPath);
            Log.info(`[app-core] Copied frontend entry: ${targetIndexPath}`);
        }
        else
        {
            Log.info(`[app-core] Preserved existing frontend entry: ${targetIndexPath}`);
        }
    }

    Log.info('[app-core] Frontend synchronisation completed');
}
