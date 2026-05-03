/**
 * AppCoreJS Framework
 * APP LAYER
 * INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { Server } from './app/server/Server.js';
import { Log } from './app/Log.js';

const server = new Server();
const SHUTDOWN_TIMEOUT = 5000;

let isShuttingDown = false;

async function shutdown(signal)
{
    if (isShuttingDown)
    {
        return;
    }

    isShuttingDown = true;
    Log.info(`${signal} received, stopping server...`);

    const timeout = new Promise((resolve) =>
    {
        setTimeout(() =>
        {
            Log.warning(`Server stop timeout after ${SHUTDOWN_TIMEOUT}ms, forcing exit...`);
            resolve();
        }, SHUTDOWN_TIMEOUT);
    });

    await Promise.race([
        server.stop(),
        timeout,
    ]);

    process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

await server.start();