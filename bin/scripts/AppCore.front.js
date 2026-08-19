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
import { copyDirectory, copyFileIfMissing, resolveProjectRoot } from './AppCore.helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function synchroniseFrontend(frameworkRoot = null, projectRoot = null, projectName = null, options = null)
{
    Log.info('[app-core] Frontend synchronisation...');

    const resolvedFrameworkRoot = frameworkRoot ?? path.resolve(__dirname, '..', '..');
    const resolvedProjectRoot = projectRoot ?? resolveProjectRoot();
    const resolvedOptions = options ?? {};
    const includeIntro = Boolean(resolvedOptions.intro);
    const includeExt = Boolean(resolvedOptions.ext);
    const sourcePublic = path.join(resolvedFrameworkRoot, 'src', 'public');
    const sourcePublicCore = path.join(sourcePublic, 'core');
    const sourcePublicApp = path.join(sourcePublic, 'app');
    const sourceData = path.join(sourcePublic, 'js', 'io', 'Data.js');
    const targetPublic = path.resolve(resolvedProjectRoot, projectName, 'public');
    const targetPublicCore = path.join(targetPublic, 'core');
    const targetPublicApp = path.join(targetPublic, 'app');
    const targetProjectJs = path.join(targetPublic, 'js');
    const targetProjectStyles = path.join(targetPublic, 'styles');
    const targetProjectTpl = path.join(targetPublic, 'tpl');
    const targetData = path.join(targetProjectJs, 'io', 'Data.js');
    const exclusions = ['core', 'app'];

    if (!includeExt)
    {
        exclusions.push('ext');
    }

    if (!includeIntro)
    {
        exclusions.push('intro');
    }

    await fs.mkdir(targetPublic, { recursive: true });
    await fs.mkdir(targetProjectJs, { recursive: true });
    await fs.mkdir(targetProjectStyles, { recursive: true });
    await fs.mkdir(targetProjectTpl, { recursive: true });
    await fs.rm(targetPublicCore, { recursive: true, force: true });
    await copyDirectory(sourcePublicCore, targetPublicCore, { override: true });
    await copyDirectory(sourcePublicApp, targetPublicApp, { override: false, coreOverride: false });
    await copyDirectory(sourcePublic, targetPublic, { override: false, coreOverride: false, exclusions });
    await fs.mkdir(path.dirname(targetData), { recursive: true });
    await copyFileIfMissing(sourceData, targetData);

    Log.info('[app-core] Frontend synchronisation completed');
}

