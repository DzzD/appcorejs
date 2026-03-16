#!/usr/bin/env node
/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */


import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildScript = resolve(__dirname, 'scripts', 'AppCore.js');

const child = spawn(process.execPath, [buildScript, ...process.argv.slice(2)],
{
    stdio: 'inherit'
});

child.on('exit', (code) =>
{
    process.exit(code ?? 0);
});
