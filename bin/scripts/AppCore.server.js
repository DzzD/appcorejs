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
import { resolveProjectRoot } from './AppCore.helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function synchroniseServer(frameworkRoot = null, projectRoot = null, projectName = null)
{
    Log.info('[app-core] Server synchronisation...');

    const resolvedFrameworkRoot = frameworkRoot ?? path.resolve(__dirname, '..', '..');
    const resolvedProjectRoot = projectRoot ?? resolveProjectRoot();
    const projectClassName = buildProjectClassName(projectName);
    const sourceServerPath = path.join(resolvedFrameworkRoot, 'src', 'server.js');
    const targetServerPath = path.resolve(resolvedProjectRoot, 'server.js');
    const targetProjectServerDirectory = path.resolve(resolvedProjectRoot, projectName, 'server');
    const targetProjectServerComponentsDirectory = path.join(targetProjectServerDirectory, 'components');
    const targetProjectServerClassPath = path.join(targetProjectServerDirectory, `${projectClassName}Server.js`);

    await fs.mkdir(targetProjectServerDirectory, { recursive: true });
    await fs.mkdir(targetProjectServerComponentsDirectory, { recursive: true });

    await createProjectServerClassIfMissing(targetProjectServerClassPath, projectClassName);
    await createRootServerIfMissing(sourceServerPath, targetServerPath, projectName, projectClassName);

    Log.info('[app-core] Server synchronisation completed');
}

async function createProjectServerClassIfMissing(targetPath, projectClassName)
{
    const content = `
/**
 * AppCoreJS Project Server
 *
 * Project-specific server class.
 * This file is created once and is not overwritten by synchronization.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from '../../app/server/Server.js';
import { StaticFileServerComponent } from '../../app/server/components/StaticFileServerComponent.js';
import { ChromeDevToolsServerComponent } from '../../app/server/components/ChromeDevToolsServerComponent.js';

const baseDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export class ${projectClassName}Server extends Server
{
    constructor()
    {
        super();
        this.devModeEnabled = true;
        this.registerServerComponent(new ChromeDevToolsServerComponent());
        this.registerServerComponent(new StaticFileServerComponent());
    }

    get baseDirectory()
    {
        return baseDirectory;
    }
}
`;

    await writeFileIfMissing(targetPath, content.replace(/^.*\r?\n/, ''), 'project server class');
}

async function createRootServerIfMissing(sourcePath, targetPath, projectName, projectClassName)
{
    const frameworkServerContent = await fs.readFile(sourcePath, 'utf8');
    const projectServerContent = frameworkServerContent
        .replace(
            /import\s*\{\s*Server\s*\}\s*from\s*'\.\/app\/server\/Server\.js';/,
            `import { ${projectClassName}Server } from './${projectName}/server/${projectClassName}Server.js';`
        )
        .replace(
            /const\s+server\s*=\s*new\s+Server\(\);/,
            `const server = new ${projectClassName}Server();`
        );

    await writeFileIfMissing(targetPath, projectServerContent, 'server entry');
}

async function writeFileIfMissing(targetPath, content, label)
{
    try
    {
        await fs.writeFile(targetPath, content, { encoding: 'utf8', flag: 'wx' });
        Log.info(`[app-core] Copied ${label}: ${targetPath}`);
    }
    catch (error)
    {
        if (error && error.code === 'EEXIST')
        {
            Log.info(`[app-core] Preserved existing ${label}: ${targetPath}`);
            return;
        }

        throw error;
    }
}

function buildProjectClassName(projectName)
{
    const segments = String(projectName)
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter((segment) => segment.length > 0);

    return segments
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join('');
}
