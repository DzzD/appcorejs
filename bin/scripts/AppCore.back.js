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

export async function synchroniseBackend(frameworkRoot = null, projectRoot = null, projectName = null)
{
    Log.info('[app-core] Backend synchronisation...');

    const resolvedFrameworkRoot = frameworkRoot ?? path.resolve(__dirname, '..', '..');
    const resolvedProjectRoot = projectRoot ?? resolveProjectRoot();
    const sourceApp = path.join(resolvedFrameworkRoot, 'src', 'app');
    const sourceCore = path.join(resolvedFrameworkRoot, 'src', 'core');
    const sourceProject = path.join(resolvedFrameworkRoot, 'src', 'project');
    const sourceIndex = path.join(resolvedFrameworkRoot, 'src', 'index.js');
    const sourceIndexBackup = path.join(resolvedFrameworkRoot, 'src', 'index.backup.js');
    const targetApp = path.resolve(resolvedProjectRoot, 'app');
    const targetCore = path.resolve(resolvedProjectRoot, 'core');
    const targetProject = path.resolve(resolvedProjectRoot, projectName);
    const targetProjectDbModels = path.join(targetProject, 'db', 'models');
    const targetProjectDbQueries = path.join(targetProject, 'db', 'queries');
    const targetIndex = path.resolve(resolvedProjectRoot, 'index.js');

    await copyDirectory(sourceApp, targetApp, { override: false, coreOverride: false });

    await fs.rm(targetCore, { recursive: true, force: true });
    await copyDirectory(sourceCore, targetCore, { override: true });

    await fs.mkdir(targetProject, { recursive: true });
    await copyDirectoryIfExists(sourceProject, targetProject, { override: false, coreOverride: false });
    await fs.mkdir(targetProjectDbModels, { recursive: true });
    await fs.mkdir(targetProjectDbQueries, { recursive: true });

    await copyFileIfMissing(await resolveFirstExistingFile([sourceIndex, sourceIndexBackup]), targetIndex, 'backend entry');

    Log.info('[app-core] Backend synchronisation completed');
}

async function copyDirectoryIfExists(sourceDirectory, destinationDirectory, options)
{
    try
    {
        await fs.access(sourceDirectory);
    }
    catch
    {
        return;
    }

    await copyDirectory(sourceDirectory, destinationDirectory, options);
}

async function copyFileIfMissing(sourcePath, destinationPath, label)
{
    if (!sourcePath)
    {
        return;
    }

    try
    {
        await fs.copyFile(sourcePath, destinationPath, fsConstants.COPYFILE_EXCL);
        Log.info(`[app-core] Copied ${label}: ${destinationPath}`);
    }
    catch (error)
    {
        if (error && error.code === 'EEXIST')
        {
            Log.info(`[app-core] Preserved existing ${label}: ${destinationPath}`);
            return;
        }

        throw error;
    }
}

async function resolveFirstExistingFile(candidates)
{
    for (const candidate of candidates)
    {
        try
        {
            await fs.access(candidate);
            return candidate;
        }
        catch
        {
        }
    }

    return null;
}
