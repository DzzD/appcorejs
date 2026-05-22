/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */
import { Log } from "../../app/js/Log.js";

export class CoreComponent
{
    static appcoreClass = "app.js.component";

    #resizeObserver = null;
    isLoaded;
    parent;
    id;
    template;
    childs;
    path;
    visibilityDuration;

    constructor(componentId, parent = null)
    {
        this.isLoaded = false;
        this.parent = parent;
        this.id = componentId;
        this.template = null;
        this.templatePath = null;
        this.childs = new Map();  
        this.path = null;
        this.visibilityDuration = 250;
    }


    async onLoad()
    {
        await Loader.loadStyle("app/styles/component.css"); 
        
        
    }    

    onUnload()
    {
        
    }    

    onResize()
    {
        
    }    

    async _show(node, args = {})
    {
        if (!node) { Log.debug("Missing node"); return Promise.resolve(); }

        const duration = args.duration ?? this.visibilityDuration;

        if (this.visibilityTimeout)
        {
            clearTimeout(this.visibilityTimeout);
            this.visibilityTimeout = null;
        }

        node.style.pointerEvents = args.pointerEvents ?? "auto";

            console.log("duration",duration);
        if (!duration)
        {
            node.classList.remove("hidden");
            node.classList.remove("invisible");
            node.classList.add("visible");

            return Promise.resolve();
        }

        node.classList.remove("hidden");
        node.classList.remove("visible");
        node.classList.add("invisible");

        node.style.transition = `opacity ${duration}ms ease`;

        return new Promise((resolve) =>
        {
            requestAnimationFrame(() =>
            {
                node.classList.remove("invisible");
                node.classList.add("visible");

                this.visibilityTimeout = setTimeout(() =>
                {
                    this.visibilityTimeout = null;
                    node.style.transition = "";
                    resolve();
                }, duration);
            });
        });
    }

    async show(args = {})
    {
        return this._show(this.node, args);
    }

    async _hide(node, args = {})
    {
        if (!node) { Log.debug("Missing node"); return Promise.resolve(); }

        const duration = args.duration ?? this.visibilityDuration;

        if (this.visibilityTimeout)
        {
            clearTimeout(this.visibilityTimeout);
            this.visibilityTimeout = null;
        }

        node.style.pointerEvents = "none";

            console.log("duration",duration);
        if (!duration)
        {
            node.classList.add("hidden");
            node.classList.add("invisible");
            node.classList.remove("visible");

            return Promise.resolve();
        }

        node.style.transition = `opacity ${duration}ms ease`;

        return new Promise((resolve) =>
        {
            requestAnimationFrame(() =>
            {
                node.classList.add("invisible");
                node.classList.remove("visible");

                this.visibilityTimeout = setTimeout(() =>
                {
                    this.visibilityTimeout = null;
                    node.classList.add("hidden");
                    node.style.transition = "";
                    resolve();
                }, duration);
            });
        });
    } 

    async hide(args = {})
    {
        return this._hide(this.node, args);
    }

    async close(args)
    {
    }

    find(selector)
    {
        return this.node.querySelector(selector);
    }

    findAll(selector)
    {
        return [...this.node.querySelectorAll(selector)];
    }    

    get node()
    {
        const buildSelector = (component) =>
        {
            const selector = `[data-appcore-id="${component.id}"]`;
            return component.parent
                ? `${buildSelector(component.parent)} ${selector}`
                : selector;
        };
        return document.querySelector(buildSelector(this));
    }

    getChild(id, deep = true)
    {
        for (const child of this.childs.values())
        {
            if (child.id.endsWith(id))
            {
                return child;
            }

            if (deep)
            {
                const found = child.getChild(id, true);

                if (found)
                {
                    return found;
                }
            }
        }

        return null;
    }

    findPathChild(segment)
    {
        Log.info("segment " + segment);

        for (const child of this.childs.values())
        {
            if (child.path === segment || child.path === "*")
            {
                return child;
            }
        }

        return null;
    }

    onPathHere()
    {
        Log.debug(`Path resolved on component "${this.id}".`);
    }

    onPathNotFound(segment, parts = [])
    {
        Log.warn(`Path segment "${segment}" not found from component "${this.id}".`);
    }    

    onPath(path = "/")
    {
        Log.info("path" + path);

        const parts = path.split("/").filter(Boolean);
        const segment = parts.shift();

        if (!segment)
        {
            return this.onPathHere();
        }

        const child = this.findPathChild(segment);

        if (!child)
        {
            return this.onPathNotFound(segment, parts);
        }

        if (child.path === "*")
        {
            return child.onPath(path);
        }

        return child.onPath("/" + parts.join("/"));
    }   

    static async setInnerHtml(node, html)
    {
        node.innerHTML = html;

        const parentNode = node.closest("[data-appcore-id]");

        if (!parentNode?.appcore)
        {
            return;
        }

        await parentNode.appcore.loadChildComponents(node);
    }    

    async loadChildComponents(rootNode = this.node)
    {
        const childElements = this.#getClosestChildComponentElements(rootNode);

        for (const childElement of childElements)
        {
            const componentId = childElement.getAttribute("data-appcore-id");

            const component = await this.loadComponent(componentId);
            component.parent = this;
            this.childs.set(component.id, component);

            await component.load();
        }
    }    

    async load()
    {
        if (this.isLoaded)
        {
            return;
        }

        const templateAttribute = this.templatePath ?? this.node.getAttribute('data-template');

        if (templateAttribute)
        {
            this.templatePath = templateAttribute;
            const resolvedTemplatePath = this.#resolveTemplatePath(templateAttribute);
            this.template = await Loader.loadTemplate(resolvedTemplatePath);
            await this.loadTemplate();
        }

        this.node.appcore = this;
        this.node.dataset.appcoreClass = this.appcoreClasses;

        for (const [key, value] of Object.entries(this.node.dataset))
        {
            this[key] = value;
        }

        for (
                let prototype = Object.getPrototypeOf(this);
                prototype && prototype !== Object.prototype;
                prototype = Object.getPrototypeOf(prototype)
            )
            {
                const descriptors = Object.getOwnPropertyDescriptors(prototype);

                for (const [property, descriptor] of Object.entries(descriptors))
                {
                    if (property === "constructor")
                    {
                        continue;
                    }

                    if (!descriptor.get && !descriptor.set)
                    {
                        continue;
                    }

                    Object.defineProperty(this.node, property, {
                        get: descriptor.get ? () => this[property] : undefined,
                        set: descriptor.set ? (value) => { this[property] = value; } : undefined,
                        configurable: true,
                    });
                }
            }

        await this.loadChildComponents(this.node);

        this.#resizeObserver = new ResizeObserver(() =>
        {
            this.onResize();
        }); 

        this.#resizeObserver.observe(this.node);

        await this.onLoad();

        this.isLoaded = true;
    }

    unload()
    {
        if (!this.isLoaded)
        {
            return;
        }

        for (const child of this.childs.values())
        {
            child.unload();
        }
        this.childs.clear();

        this.onUnload();

        this.#resizeObserver?.disconnect();
        this.#resizeObserver = null;

        this.isLoaded = false;
    }    

    async loadComponent(componentId)
    {
        const { filePath, className} = this.explodeId(componentId);
        const cls = await Loader.loadClass(filePath, className);

        if(!cls)
        {
            Log.warn(`Failed to create component "${componentId}". Replaced with generic class "CoreComponent".`);
            return  new CoreComponent(componentId, this);
        }

        const component = new cls(componentId, this);
        return component;
    }


    explodeId(componentId)
    {
        const [path, uid] = componentId.split('::');
        const parts = path.split('.');
        const rawClassName = parts.pop();
        const filePath = parts.join('/');

        const className = rawClassName
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join('');

        return {
            filePath,
            className,
            uid
        };
    }


    async loadTemplate()
    {
        if (!this.template)
        {
            return;
        }

        const templateWrapper = document.createElement('template');
        templateWrapper.innerHTML = this.template.trim();

        const templateRoot = templateWrapper.content.firstElementChild;

        if (!templateRoot)
        {
            return;
        }

        const currentNode = this.node;
        const currentZones = new Map();

        for (const zone of currentNode.querySelectorAll('[data-zone]'))
        {
            currentZones.set(zone.getAttribute('data-zone'), zone.cloneNode(true));
        }

        for (const attribute of templateRoot.attributes)
        {
            if (attribute.name === 'data-template')
            {
                continue;
            }

            if (!currentNode.hasAttribute(attribute.name))
            {
                currentNode.setAttribute(attribute.name, attribute.value);
            }
        }

        for (const templateZone of templateRoot.querySelectorAll('[data-zone]'))
        {
            const zoneName = templateZone.getAttribute('data-zone');
            const currentZone = currentZones.get(zoneName);

            if (!currentZone)
            {
                continue;
            }

            for (const attribute of templateZone.attributes)
            {
                if (!currentZone.hasAttribute(attribute.name))
                {
                    currentZone.setAttribute(attribute.name, attribute.value);
                }
            }

            templateZone.replaceWith(currentZone);
        }

        currentNode.replaceChildren();

        const fragment = document.createDocumentFragment();

        while (templateRoot.firstChild)
        {
            fragment.appendChild(templateRoot.firstChild);
        }

        currentNode.appendChild(fragment);
    }
    
    #resolveTemplatePath(templateId)
    {
        const filePath = templateId.split(".").join("/");
        return new URL(`${filePath}.tpl.html`, document.baseURI).href;
    }        
    
    #getClosestChildComponentElements(rootElement)
    {
        const result = [];
        const all = rootElement.querySelectorAll('[data-appcore-id]');

        for (const element of all)
        {
            const parentComponent = element.parentElement?.closest('[data-appcore-id]');

            if (parentComponent === this.node)
            {
                result.push(element);
            }
        }

        return result;
    }

    get appcoreClasses()
    {
        const classes = [];

        for (
            let currentClass = this.constructor;
            currentClass && currentClass !== Function.prototype;
            currentClass = Object.getPrototypeOf(currentClass)
        )
        {
            const appcoreClass = Object.hasOwn(currentClass, "appcoreClass")
                ? currentClass.appcoreClass
                : null;

            if (appcoreClass)
            {
                classes.push(appcoreClass);
            }
        }

        return classes.reverse().join(" ");
    }

}
