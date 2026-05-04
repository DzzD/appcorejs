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

import { ServerComponent } from '../../../app/server/ServerComponent.js';
import { Log } from '../../../app/Log.js';

export class CoreStaticFileServerComponent extends ServerComponent
{
    directory;

    constructor(directory = 'public')
    {
        super();
        this.directory = directory;
    }

    get staticDirectory()
    {
        return path.resolve(this.server.baseDirectory, this.directory);
    }

    async start()
    {
        this.server.application.use(async (request, response, next) =>
        {
            try
            {
                const relativeFileName = request.path.replace(/^\/+/, '').replace(/\/$/, '/index.html') || 'index.html';
                const fileName = path.join(this.staticDirectory, relativeFileName);

                const result = await this.getStaticFile(fileName, request);

                if (result === null)
                {
                    next();
                    return;
                }

                response.type(path.extname(fileName)).send(result.content);
            }
            catch (error)
            {
                next(error);
            }
        });

        this.server.application.use(express.static(this.staticDirectory));
    }

    async getStaticFile(fileName, request)
    {
        Log.debug(`${request.path} => ${fileName}`);

        if (fileName.includes('.tpl.'))
        {
            return null;
        }

        const templateFileName = fileName.replace(/(\.[^./]+)$/, '.tpl$1');

        try
        {
            let content = await fs.readFile(templateFileName, 'utf8');
            content = await this.processTemplate(content, templateFileName, request);
            return { content };
        }
        catch
        {
            return null;
        }
    }

    async processTemplate(content, fileName, request)
    {
        return content;
    }
}
