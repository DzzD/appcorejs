/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Log } from '../../src/app/Log.js';
import { copyDirectory, resolveProjectRoot } from './AppCore.helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function synchroniseAgentFiles(frameworkRoot = null, projectRoot = null, projectName = null)
{
    Log.info('[app-core] Agent files synchronisation...');

    const resolvedFrameworkRoot = frameworkRoot ?? path.resolve(__dirname, '..', '..');
    const resolvedProjectRoot = projectRoot ?? resolveProjectRoot();
    const sourceAgent = path.join(resolvedFrameworkRoot, 'src', 'agent');
    const targetAgent = path.join(resolvedProjectRoot, 'agent', 'appcorejs');

    await copyDirectory(sourceAgent, targetAgent, { override: true, coreOverride: true });

    Log.info('[app-core] Agent files synchronisation completed');
}
