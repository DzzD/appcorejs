/*
 * NE PAS MODIFIER — Framework AppCore (DzzD)
 * Personnalisation via la classe Application (singleton).
 * Auteur : DzzD (aka Bruno Augier)
 */


globalThis.$ = globalThis.id = (id) => { return document.getElementById(id) };
globalThis.select = (selector) => { return document.querySelector(selector) };
globalThis.selectAll = (selector, parent = document) => { return [...parent.querySelectorAll(selector)] };

export class CoreApplication
{
  datas;
  components;
  _screenCurrentId;
  _screenPreviousId;

  start()
  {
    this.datas = new Map();
    this.components = new Map();
  }


  async open(componentId, args = null)
  {
    const component = await this.getComponent(componentId);
    component.show(args);
  }

  async close(componentId)
  {
    const component = await this.getComponent(componentId);
    component.hide();   
  }

  async getComponent(componentId)
  {
    let component = this.components.get(componentId);
    if (component) return component;

    console.log(`loadClass(${componentId})`, this._componentIdToClassFile(componentId));

    const cls = await this._loadClass(this._componentIdToClassFile(componentId));
    console.log(cls);

    component = new cls(componentId);
    this.components.set(componentId, component);

    return component;
  }

  _componentIdToClassFile(componentId)
  {
      const segments = componentId.split('.');

      return `/${segments.map((segment, index) => index === segments.length - 1 ? segment.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('') : segment).join('/')}.js`;
  }

  async _loadClass(classFile)
  {
    const module = await import(classFile);
    console.log("import",classFile);
    console.log("import",classFile.split('/').pop().replace(/\.[^.]+$/, ''));
    return module.default || module[classFile.split('/').pop().replace(/\.[^.]+$/, '')];
  }

  /*
  * Point d’entrée de l’application.
  */
  static boot()
  {
    const app = new this(); // this = classe appelante (Application du développeur)
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

