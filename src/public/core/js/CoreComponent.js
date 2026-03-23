/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */


export class CoreComponent
{
    #resizeObserver = null;
    isLoaded;
    parent;
    id;
    template;
    childs;

    constructor(componentId, parent = null)
    {
        this.isLoaded = false;
        this.parent = parent;
        this.id = componentId;
        this.template = null;
        this.childs = new Map();  
             
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

    async action(action, args)
    {
        Log.debug(action);
    }

    async open(args)
    {
    }

    async _show(node, args)
    {
        if(!node) { Log.debug("Missing node"); return; }
        node.classList.add('invisible');
        node.classList.remove('visible');
        node.classList.remove('hidden');
        setTimeout(() => {node.classList.add('visible');node.classList.remove('invisible')}, 50);        
    }

    async show(args)
    {
        this._show(this.node);
    }

    async _hide(node, args)
    {
        if(!node) { Log.debug("Missing node"); return; }
        node.classList.add('invisible');
        node.classList.remove('visible');
        setTimeout(() => {node.classList.add('hidden')}, 500);
    }

    async hide(args)
    {
        this._hide(this.node);
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

    async load()
    {
        if (this.isLoaded)
        {
            return;
        }

        const childElements = this.#getClosestChildComponentElements(this.node);
        
        for (const childElement of childElements)
        {
            const componentId = childElement.getAttribute('data-appcore-id');
            const component = await this.loadComponent(componentId);
            component.parent = this;
            this.childs.set(component.id, component);
            await component.load();            
        }
        this.node.appcore = this;
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
            Log.warning(`Failed to create component "${componentId}". Replaced with generic class "CoreComponent".`);
            return  new CoreComponent(componentId, this);
        }

        const component = new cls(componentId, this);
        return component;
    }


    // extractTemplate()
    // {
    //     const clone = this.node.cloneNode(true);
    //     const childComponents = this.#getClosestChildComponentElements(clone);

    //     for (const child of childComponents)
    //     {
    //         const componentId = child.getAttribute('data-appcore-id');
    //         child.replaceWith(document.createTextNode(`{{${componentId}}}`));
    //     }

    //     return clone.outerHTML;
    // }    

    

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