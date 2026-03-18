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
        this.node.action = function(action, args){self.action(action, args)};
        app._loadStyle("core/styles/core-component.css");
    }

    action(action, args)
    {
        Log.info(action);
        Log.info(args);
        Log.info(args);
        Log.info(this.node);
        // this.hide();
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

    getChild(id, deep = true)
    {
        for (const child of this.childs.values())
        {
            if (child.id === id)
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

    async initChilds()
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
            await component.initChilds();
        }
    }    

    async loadComponent(componentId)
    {
        const { filePath, className} = this.explodeId(componentId);
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
        Log.info(`Loading class file : ${moduleUrl.href}`);
        try
        {            
            const module = await import(moduleUrl.href);//TODO: à déplacer dans app comme style avec loadJavascrypt ou loadModule //eviter multi-chargement
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