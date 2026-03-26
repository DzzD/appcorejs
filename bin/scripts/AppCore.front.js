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

export async function synchroniseFrontend(frameworkRoot = null, projectRoot = null)
{
    Log.info('[app-core] Frontend synchronisation...');

    const resolvedFrameworkRoot = frameworkRoot ?? path.resolve(__dirname, '..', '..');
    const resolvedProjectRoot = projectRoot ?? resolveProjectRoot();
    const sourcePublic = path.join(resolvedFrameworkRoot, 'src', 'public');
    const targetPublic = path.resolve(resolvedProjectRoot, 'public');

    await copyDirectory(sourcePublic, targetPublic, false);

    Log.info('[app-core] Frontend synchronisation completed');
}
