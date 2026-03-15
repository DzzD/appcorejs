/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Log } from '../app/Log.js';

export class CoreServer
{
    #application;
    #httpServer;
    #staticDirectory;

    constructor()
    {
        this.#staticDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
        this.#application = express();
        this.#httpServer = null;
        this.#application.use(express.json());
        this.#application.use(express.static(this.#staticDirectory));

    }

    async start(host = '127.0.0.1', port = 3000)
    {
        return new Promise((resolve, reject) =>
        {
            this.#httpServer = this.#application.listen(port, host, () =>
            {
                Log.info(`Server listening on http://${host}:${port}`);
                resolve();
            });

            this.#httpServer.once('error', reject);
        });
    }

    get application()
    {
        return this.#application;
    }

    get httpServer()
    {
        return this.#httpServer;
    }

    get staticDirectory()
    {
        return this.#staticDirectory;
    }

    async stop()
    {
        return new Promise((resolve, reject) =>
        {
            this.#httpServer.close((error) =>
            {
                if (error)
                {
                    reject(error);
                    return;
                }

                this.#httpServer = null;
                resolve();
            });
        });
    }    
}
