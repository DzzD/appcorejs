/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */


export class CoreComponent
{
    parent;
    id;
    template;
    childs;

    constructor(componentId, parent = null)
    {
        this.parent = parent;
        this.id = componentId;
        this.template = null;
        this.childs = new Map();
    }

    loaded()
    {
        this.template = this.extractTemplate();
        const self = this;
        this.node.action = function(action, ...args){self.action(action, ...args)};
    }

    action(action, ...args)
    {
        Log.info(action);
        Log.info(args[0]);
        this.hide();
    }

    show()
    {
        this.node.classList.remove('hidden');
    }

    hide()
    {
        this.node.classList.add('hidden');
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

    get idParts()
    {
        const [path, uid] = this.id.split('::');
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

    async initChildComponents()
    {
        const childElements = this.#getClosestChildComponentElements(this.node);

        for (const childElement of childElements)
        {
            const componentId = childElement.getAttribute('data-appcore-id');
            const component = await this.loadComponent(componentId);

            if(!component)
            {
                Log.info(`Ignoring ${componentId}.`);
                continue;
            }

            component.parent = this;
            this.childs.set(component.id, component);

            component.loaded();
            await component.initChildComponents();
        }
    }    

    async loadComponent(componentId)
    {
        const { filePath, className} = this.idParts;
        const cls = await this._loadClass(filePath, className);

        if(!cls)
        {
            Log.info(`Failed to create component "${componentId}". Replaced with generic class "CoreComponent".`);
            return  new CoreComponent(componentId, this);
        }

        const component = new cls(componentId, this);
        component.loaded();

        return component;
    }

    async _loadClass(filePath, className)
    {
        
        const moduleUrl = new URL(`${filePath}/${className}.js`, document.baseURI);
        Log.info(`Loading file : ${moduleUrl.href}`);
        try
        {            
            const module = await import(moduleUrl.href);
            Log.info(`Component file loaded : ${moduleUrl.href}`);
            return module.default || module[className];
        }
        catch(error)
        {
            Log.error(`Component file not found or invalid: ${moduleUrl.href}`);
            return null;
        }        
    }    

    extractTemplate()
    {
        const clone = this.node.cloneNode(true);
        const childComponents = this.#getClosestChildComponentElements(clone);

        for (const child of childComponents)
        {
            const componentId = child.getAttribute('data-appcore-id');
            child.replaceWith(document.createTextNode(`{{${componentId}}}`));
        }

        return clone.outerHTML;
    }    
    
    #getClosestChildComponentElements(rootElement)
    {
        const result = [];
        const all = rootElement.querySelectorAll('[data-appcore-id]');

        for (const element of all)
        {
            const parentComponent = element.parentElement?.closest('[data-appcore-id]');

            if (parentComponent === rootElement)
            {
                result.push(element);
            }
        }

        return result;
    }

}