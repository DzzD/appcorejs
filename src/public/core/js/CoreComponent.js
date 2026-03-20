/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */


export class CoreComponent
{
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
        Loader.loadStyle("core/styles/core-component.css");      
    }

    action(action, args)
    {
        Log.info(action);
    }

    open(args)
    {
    }

    show(args)
    {
        this.node.classList.add('invisible');
        this.node.classList.remove('visible');
        this.node.classList.remove('hidden');
        setTimeout(() => {this.node.classList.add('visible');this.node.classList.remove('invisible')}, 50);
    }

    hide(args)
    {
        this.node.classList.add('invisible');
        this.node.classList.remove('visible');
        setTimeout(() => {this.node.classList.add('visible');this.node.classList.add('hidden')}, 500);
    }

    close(args)
    {

    }

    loaded()
    {
        if (this.isLoaded)
        {
            return;
        }
        
        this.node.appcore = this;
        // this.node.action = (action, args) => this.action(action, args);
        this.isLoaded = true;
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

            // component.loaded();
            await component.initChilds();
        }
    }    

    async loadComponent(componentId)
    {
        const { filePath, className} = this.explodeId(componentId);
        const cls = await Loader.loadClass(filePath, className);

        if(!cls)
        {
            Log.info(`Failed to create component "${componentId}". Replaced with generic class "CoreComponent".`);
            return  new CoreComponent(componentId, this);
        }

        const component = new cls(componentId, this);
        component.loaded();

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