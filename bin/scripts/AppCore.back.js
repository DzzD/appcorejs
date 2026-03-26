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
import { copyDirectory, resolveProjectRoot } from './AppCore.helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function synchroniseBackend(frameworkRoot = null, projectRoot = null)
{
    Log.info('[app-core] Backend synchronisation...');

    const resolvedFrameworkRoot = frameworkRoot ?? path.resolve(__dirname, '..', '..');
    const resolvedProjectRoot = projectRoot ?? resolveProjectRoot();
    const sourceApp = path.join(resolvedFrameworkRoot, 'src', 'app');
    const sourceCore = path.join(resolvedFrameworkRoot, 'src', 'core');
    const targetApp = path.resolve(resolvedProjectRoot, 'app');
    const targetCore = path.resolve(resolvedProjectRoot, 'core');

    await copyDirectory(sourceApp, targetApp, { override: false });
    await copyDirectory(sourceCore, targetCore, { override: true });

    Log.info('[app-core] Backend synchronisation completed');
}
