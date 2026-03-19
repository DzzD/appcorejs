/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Log } from '../app/Log.js';

export class CoreServer
{
    #application;
    #httpServer;
    #staticDirectory;
    appName;
    appShortName;

    constructor()
    {
        this.appName = "Your Application Name";
        this.appShortName = "your-app-short-name";
        this.#staticDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
        this.#application = express();
        this.#httpServer = null;
        this.#application.use(express.json());

        this.#application.use(async (request, response, next) =>
        {
            try
            {
                const relativeFileName = request.path.replace(/^\/+/, '').replace(/\/$/, '/index.html') || 'index.html';
                const fileName = path.join(this.#staticDirectory, relativeFileName);

                const content = await this.static(fileName, request);

                if (content === null)
                {
                    next();
                    return;
                }

                response.type(path.extname(fileName)).send(content);
            }
            catch (error)
            {
                next(error);
            }
        });

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

    async static(fileName, request)
    {
        Log.info(request.path);
        if (fileName.endsWith('index.html'))
        {
            let content = await fs.readFile(fileName, 'utf8');
            content = content.replaceAll("{{APP_NAME}}", this.appName);
            return content;
        }

        
        if (fileName.endsWith('manifest.json'))
        {
            let content = await fs.readFile(fileName, 'utf8');
            content = content.replaceAll("{{APP_NAME}}", this.appName)
                             .replaceAll("{{APP_SHORT_NAME}}", this.appShortName);
            return content;
        }

        return null;
        
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
