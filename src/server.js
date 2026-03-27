/**
 * AppCoreJS Framework
 * APP LAYER
 * INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { Server } from './app/net/Server.js';
import { Log } from './app/Log.js';

const server = new Server();
let isShuttingDown = false;

async function shutdown(signal)
{
    if (isShuttingDown)
    {
        return;
    }

    isShuttingDown = true;
    Log.info(`${signal} received, stopping server...`);
    await server.stop();
    process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

await server.start();
