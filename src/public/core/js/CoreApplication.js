/** 
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { Component } from "../../app/js/Component.js";
import { Loader } from "../../app/js/Loader.js";
import { Log } from '../../app/js/Log.js';

globalThis.appcore = (componentId) =>
{
  
    const element = document.querySelector(`[data-appcore-id="${componentId}"]`)
        || document.querySelector(`[data-appcore-id$="::${componentId}"]`)
        || document.querySelector(`[data-appcore-id$="${componentId}"]`)
        || document.querySelector(`[data-appcore-id^="${componentId}::"]`);

    // Log.info(`appcore(${componentId}) = ${element}`);
    // Log.info(element);
    return element?.appcore || null;
};
globalThis.Loader = Loader;
globalThis.Log = Log;
Log.mode = "debug";

export class CoreApplication extends Component
{
    static appcoreClass = "app.js.application";
    static appcoreCss = "app.css.application";

    static version = "1.0";
    static dataClass = null;

  constructor(componentId, parent = null)
  {
      super(componentId, parent);
      globalThis.App = this;
      this.data = new this.constructor.dataClass();
      this.uri = "/";
  }

  async onLoad()
  {
      await super.onLoad();

      const application = this.find('[data-zone="application"]');
      const loader = this.find(".application-loader");

      application?.style.removeProperty("display");

      await this._show(application);
      await this._hide(loader);

      if (loader?.appcore)
      {
          loader.appcore.unload();
          this.childs.delete(loader.appcore.id);
      }

      loader?.remove();

    Log.info("[CoreApplication] AppCoreJS - Application ready!");

      window.addEventListener('hashchange', () =>
      {
          this.onUrlChange();
      });

      this.onUrlChange();
  }
  
  onUrlChange()
  {
    const uri = location.hash.slice(1) || '/';
    Log.info("[CoreApplication] uri" + uri);
    this.onPath(uri);
  }  

  /*
  * User application booting
  */
  static async boot()
  {
    //   const app = new this("app.js.application");
            Loader.setVersion(this.version);
    this.dataClass = await Loader.loadClass("js/io", "Data");
      window.app = new this("app.js.application");
      await app.load();
  }
}

