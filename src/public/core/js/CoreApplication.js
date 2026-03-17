/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */


globalThis.$ = globalThis.id = (id) => { return document.getElementById(id) };
globalThis.select = (selector) => { return document.querySelector(selector) };
globalThis.selectAll = (selector, parent = document) => { return [...parent.querySelectorAll(selector)] };

globalThis.extractTemplate = (htmlElement) =>
    {
        const clone = htmlElement.cloneNode(true);
        const childComponents = getClosestChildComponentElements(clone);

        for (const child of childComponents)
        {
            const componentId = child.getAttribute('data-appcore-id');
            child.replaceWith(document.createTextNode(`{{${componentId}}}`));
        }

        return clone.outerHTML;
    }    

globalThis.getClosestChildComponentElements = (rootElement) =>
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


export class CoreApplication
{
  components;
  _screenCurrentId;
  _screenPreviousId;

  start()
  {
    this.components = new Map();
    console.log(extractTemplate(document.body));
  }


  async open(componentId, args = null)
  {
    let component = this.components.get(componentId);
    if (!component) 
    {
      component = await app.loadComponent(componentId);
      this.components.set(componentId, component);
      // component.load();
    }
    component.show(args);
  }

  async close(componentId)
  {
    const component = await this.getComponent(componentId);
    component.hide();   
  }

  async click()
  {
    alert(event.target);
  }

  parseComponentId(componentId)
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

  async loadComponent(componentId)
  {
    const { filePath, className, uid } = this.parseComponentId(componentId);
    const cls = await this._loadClass(filePath, className);
    const component = new cls(componentId);
    component.load();
    return component;
  }

  async _loadClass(filePath, className)
  {
    const moduleUrl = new URL(`${filePath}/${className}.js`, document.baseURI);
    const module = await import(moduleUrl.href);

    return module.default || module[className];
  }

  /*
  * User application booting
  */
  static boot()
  {
    const app = new this(); 
    window.app = app;

    const start = () => app.start();

    if (document.readyState === 'loading')
      document.addEventListener('DOMContentLoaded', start);
    else
      start();

    document.fonts.ready.then(() =>
    {
      document.body.classList.add('fonts-loaded');
    });
  }
}

