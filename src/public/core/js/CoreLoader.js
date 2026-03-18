/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { Log } from "../../app/js/Log.js";

export class CoreLoader
{
    static loadedScripts = new Set();
    static loadedStyles = new Set();

    static async loadClass(filePath, className)
    {
        const moduleUrl = new URL(`${filePath}/${className}.js`, document.baseURI);
        const href = moduleUrl.href;

        if (this.loadedScripts.has(href))
        {
            const module = await import(href);
            return module.default || module[className] || null;
        }

        Log.info(`Loading class file : ${href}`);

        try
        {
            const module = await import(href);
            this.loadedScripts.add(href);
            return module.default || module[className] || null;
        }
        catch
        {
            Log.error(`Class file not found or invalid: ${href}`);
            return null;
        }
    }

    static async loadStyle(filePath)
    {
        const styleUrl = new URL(filePath, document.baseURI);
        const href = styleUrl.href;

        if (this.loadedStyles.has(href))
        {
            return true;
        }

        const existingLink = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);

        if (existingLink)
        {
            this.loadedStyles.add(href);
            return true;
        }

        Log.info(`Loading style file : ${href}`);

        await new Promise((resolve, reject) =>
        {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = href;
            link.onload = resolve;
            link.onerror = (event) =>
            {
                Log.error(`Style file not found or invalid: ${href}`);
                reject(event);
            };

            document.head.appendChild(link);
        });

        this.loadedStyles.add(href);
        return true;
    }
}