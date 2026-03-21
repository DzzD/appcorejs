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
import { Log } from '../../app/Log.js';

export class CoreServer
{
    #chromeDevToolsPath = '/.well-known/appspecific/com.chrome.devtools.json';
    #application;
    #httpServer;
    #staticDirectory;
    #templateDirectory;
    devModeEnabled;
    appLoaderEnabled;
    appName;
    appShortName;

    constructor()
    {
        this.appName = "Your Application Name";
        this.appShortName = "your-app-short-name";
        this.devModeEnabled = false;
        this.appLoaderEnabled = true;
        const baseDirectory = path.dirname(fileURLToPath(import.meta.url));
        this.#staticDirectory = path.resolve(baseDirectory, '../../public'); 
        this.#templateDirectory = path.resolve(baseDirectory, '../front/templates');
        this.#application = express();
        this.#httpServer = null;
        this.#application.use(express.json());

        this.init();
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

    init()
    {
        this.#application.use(async (request, response, next) =>
        {
            try
            {
                const relativeFileName = request.path.replace(/^\/+/, '').replace(/\/$/, '/index.html') || 'index.html';
                const fileName = path.join(this.#staticDirectory, relativeFileName);

                const result  = await this.static(fileName, request);

                if (result === null)
                {
                    next();
                    return;
                }

                response.type(result.type || path.extname(fileName)).send(result.content);
            }
            catch (error)
            {
                next(error);
            }
        });

        this.#application.use(express.static(this.#staticDirectory));  
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
        Log.debug(request.path);

        if (request.path === this.#chromeDevToolsPath)
        {
            if (!this.devModeEnabled)
            {
                return null;
            }

            return {
                content: JSON.stringify(this.getChromeDevToolsDescriptor(), null, 2),
                type: "application/json; charset=utf-8"
            }
        }

        if (fileName.endsWith('index.html'))
        {
            let content = await fs.readFile(fileName, 'utf8');
            content = content.replaceAll("{{APPCORE_APP_NAME}}", this.appName);

            if (this.devModeEnabled)
            {
                content = content.replace(
                    "<!--{{APPCORE_DEV_MODE_BADGE}}-->",
                    await this.loadTemplate('dev-mode-badge.tpl.html')
                );
            }
            else
            {
                content = content.replace("<!--{{APPCORE_DEV_MODE_BADGE}}-->", "");
            }

            if (this.appLoaderEnabled)
            {
                content = content.replace(
                    "<!--{{APPCORE_APPLICATION_LOADER}}-->",
                    await this.loadTemplate('application-loader.tpl.html')
                );
            }
            else
            {
                content = content.replace("<!--{{APPCORE_APPLICATION_LOADER}}-->", "");
            }

            return {
                content,
                type: "text/html; charset=utf-8"
            };
        }

        
        if (fileName.endsWith('manifest.json'))
        {
            let content = await fs.readFile(fileName, 'utf8');
            content = content.replaceAll("{{APPCORE_APP_NAME}}", this.appName)
                             .replaceAll("{{APPCORE_APP_SHORT_NAME}}", this.appShortName);
           
            return {
                content,
                type: "application/manifest+json; charset=utf-8"
            };
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

    async loadTemplate(templateName)
    {
        const fileName = path.join(this.#templateDirectory, templateName);
        return await fs.readFile(fileName, 'utf8');
    }
    
    getChromeDevToolsDescriptor()
    {
        return {
            workspace:
            {
                root: this.staticDirectory,
                "uuid": "53b029bb-c989-4dca-969b-9999ecec3717"
            }
        };
    }
    
}
