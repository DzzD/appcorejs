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

export async function initialiseProject()
{
    Log.info('[app-core] Project initialisation...');

    const frameworkRoot = path.resolve(__dirname, '..', '..');
    const sourceApp = path.join(frameworkRoot, 'src', 'app');
    const sourceCore = path.join(frameworkRoot, 'src', 'core');
    const projectRoot = resolveProjectRoot();
    const targetApp = path.resolve(projectRoot, 'app');
    const targetCore = path.resolve(projectRoot, 'core');

    await copyDirectory(sourceApp, targetApp, false);
    await copyDirectory(sourceCore, targetCore, true);

    Log.info('[app-core] Project initialisation completed');
}
