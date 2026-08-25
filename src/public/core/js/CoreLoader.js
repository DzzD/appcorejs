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
    static loadingScripts = new Map();
    static loadingStyles = new Map();
    static loadingTemplates = new Map();
    static loadedClasses = new Map();
    static loadingClasses = new Map();
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

        if (url.searchParams.has("appcore-version"))
        {
            return url;
        }

        url.searchParams.set("appcore-version", this.version || "1.0");
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
        const classCacheKey = `${href}::${className}`;

        if (this.loadedClasses.has(classCacheKey))
        {
            return this.loadedClasses.get(classCacheKey);
        }

        if (this.loadingClasses.has(classCacheKey))
        {
            return await this.loadingClasses.get(classCacheKey);
        }

        const loadPromise = (async () =>
        {
            if (!this.loadedScripts.has(href))
            {
                Log.debug(`[CoreLoader] Loading class file : ${href}`);
            }

            try
            {
                const module = await import(href);
                this.loadedScripts.add(href);

                const resolvedClass = module.default || module[className] || null;
                this.loadedClasses.set(classCacheKey, resolvedClass);
                return resolvedClass;
            }
            catch (error)
            {
                Log.error(`[CoreLoader] Class file not found or invalid: ${href}`);
                throw error;
            }
        })();

        this.loadingClasses.set(classCacheKey, loadPromise);

        try
        {
            return await loadPromise;
        }
        finally
        {
            this.loadingClasses.delete(classCacheKey);
        }
    }

    static async loadStyle(filePath)
    {
        const styleUrl = this._withVersion(filePath);
        const href = styleUrl.href;

        if (this.loadedStyles.has(href))
        {
            return true;
        }

        if (this.loadingStyles.has(href))
        {
            return await this.loadingStyles.get(href);
        }

        const existingLink = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);

        if (existingLink)
        {
            this.loadedStyles.add(href);
            return existingLink;
        }

        const loadPromise = new Promise((resolve, reject) =>
        {
            Log.debug(`[CoreLoader] Loading style file : ${href}`);

            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = href;
            link.onload = () => resolve(link);
            link.onerror = (event) =>
            {
                Log.error(`[CoreLoader] Style file not found or invalid: ${href}`);
                reject(event);
            };

            document.head.appendChild(link);
        });

        this.loadingStyles.set(href, loadPromise);

        try
        {
            const link = await loadPromise;
            this.loadedStyles.add(href);
            return link;
        }
        finally
        {
            this.loadingStyles.delete(href);
        }
    }

    static async loadScript(filePath)
    {
        const scriptUrl = this._withVersion(filePath);
        const src = scriptUrl.href;

        if (this.loadedScripts.has(src))
        {
            return true;
        }

        if (this.loadingScripts.has(src))
        {
            return await this.loadingScripts.get(src);
        }

        const existingScript = document.querySelector(`script[src="${src}"]`);

        if (existingScript)
        {
            this.loadedScripts.add(src);
            return  existingScript;
        }

        const loadPromise = new Promise((resolve, reject) =>
        {
            Log.debug(`[CoreLoader] Loading script file : ${src}`);

            const script = document.createElement("script");
            script.src = src;
            script.async = false;

            script.onload = () => resolve(script);

            script.onerror = (event) =>
            {
                Log.error(`[CoreLoader] Script file not found or invalid: ${src}`);
                reject(event);
            };

            document.head.appendChild(script);
        });

        this.loadingScripts.set(src, loadPromise);

        try
        {
            const script = await loadPromise;
            this.loadedScripts.add(src);
            return script;
        }
        finally
        {
            this.loadingScripts.delete(src);
        }
    }    

    static async loadTemplate(filePath)
    {
        const templateUrl = this._withVersion(filePath);
        const href = templateUrl.href;

        if (this.loadedTemplates.has(href))
        {
            return this.loadedTemplates.get(href);
        }

        if (this.loadingTemplates.has(href))
        {
            return await this.loadingTemplates.get(href);
        }

        const loadPromise = (async () =>
        {
            const response = await fetch(href);

            if (!response.ok)
            {
                throw new Error(`Unable to load template: ${href}`);
            }

            const content = await response.text();
            this.loadedTemplates.set(href, content);
            return content;
        })();

        this.loadingTemplates.set(href, loadPromise);

        try
        {
            return await loadPromise;
        }
        finally
        {
            this.loadingTemplates.delete(href);
        }
    }
}
