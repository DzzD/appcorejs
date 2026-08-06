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
    static loadedTemplates = new Map();
    static version = "1.0";

    static setVersion(version)
    {
        if (version === undefined || version === null)
        {
            this.version = "1.0";
            return;
        }

        const normalizedVersion = String(version).trim();
        this.version = normalizedVersion || "1.0";
    }

    static _withVersion(uri)
    {
        const url = new URL(uri, document.baseURI);

        if (url.searchParams.has("v"))
        {
            return url;
        }

        url.searchParams.set("v", this.version || "1.0");
        return url;
    }

    static async loadFile(uri, type = "text")
    {
        const fileUrl = this._withVersion(uri);
        const response = await fetch(fileUrl.href);

        if (!response.ok)
        {
            throw new Error(`Unable to load file: ${fileUrl.href}`);
        }

        switch (type)
        {
            case "text":
                return await response.text();

            case "json":
                return await response.json();

            case "blob":
                return await response.blob();

            case "arrayBuffer":
                return await response.arrayBuffer();

            case "formData":
                return await response.formData();

            default:
                throw new Error(`Unsupported type: ${type}`);
        }
    } 

    static async loadClass(filePath, className)
    {
        const moduleUrl = this._withVersion(`${filePath}/${className}.js`);
        const href = moduleUrl.href;

        const loadModule = () =>
        {
            return new Promise((resolve, reject) =>
            {
                import(href)
                    .then(resolve)
                    .catch((error) =>
                    {
                        Log.error(`Class file not found or invalid: ${href}`);
                        reject(error);
                    });
            });
        };

        if (this.loadedScripts.has(href))
        {
            const module = await loadModule();
            return module.default || module[className] || null;
        }

        Log.debug(`Loading class file : ${href}`);

        const module = await loadModule();
        this.loadedScripts.add(href);
        return module.default || module[className] || null;
    }

    static async loadStyle(filePath)
    {
        const styleUrl = this._withVersion(filePath);
        const href = styleUrl.href;

        if (this.loadedStyles.has(href))
        {
            return true;
        }

        const existingLink = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);

        if (existingLink)
        {
            this.loadedStyles.add(href);
            return existingLink;
        }

        Log.debug(`Loading style file : ${href}`);

        const link = await new Promise((resolve, reject) =>
        {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = href;
            link.onload = () => resolve(link);
            link.onerror = (event) =>
            {
                Log.error(`Style file not found or invalid: ${href}`);
                reject(event);
            };

            document.head.appendChild(link);
        });

        this.loadedStyles.add(href);

        return link;
    }

    static async loadScript(filePath)
    {
        const scriptUrl = this._withVersion(filePath);
        const src = scriptUrl.href;

        if (this.loadedScripts.has(src))
        {
            return true;
        }

        const existingScript = document.querySelector(`script[src="${src}"]`);

        if (existingScript)
        {
            this.loadedScripts.add(src);
            return  existingScript;
        }

        Log.debug(`Loading script file : ${src}`);

        const script = await new Promise((resolve, reject) =>
        {
            const script = document.createElement("script");
            script.src = src;
            script.async = false;

            script.onload = () => resolve(script);

            script.onerror = (event) =>
            {
                Log.error(`Script file not found or invalid: ${src}`);
                reject(event);
            };

            document.head.appendChild(script);
        });

        this.loadedScripts.add(src);

        return script;
    }    

    static async loadTemplate(filePath)
    {
        const templateUrl = this._withVersion(filePath);
        const href = templateUrl.href;

        if (this.loadedTemplates.has(href))
        {
            return this.loadedTemplates.get(href);
        }

        const response = await fetch(href);
        if (!response.ok)
        {
            throw new Error(`Unable to load template: ${href}`);
        }

        const content = await response.text();
        this.loadedTemplates.set(href, content);
        return content;
    }
}
