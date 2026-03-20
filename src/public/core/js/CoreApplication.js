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

// globalThis.$ = globalThis.id = (id) => { return document.getElementById(id) };
// globalThis.select = (selector) => { return document.querySelector(selector) };
// globalThis.selectAll = (selector, parent = document) => { return [...parent.querySelectorAll(selector)] };
globalThis.appcore = (componentId) =>
{
    const element = document.querySelector(`[data-appcore-id="${componentId}"]`)
        || document.querySelector(`[data-appcore-id^="${componentId}::"]`);

    return element?.appcore || null;
};
globalThis.Loader = Loader;
globalThis.Log = Log;
Log.mode = "debug";




export class CoreApplication extends Component
{

  constructor(componentId, parent = null)
  {
      super(componentId, parent);
      Loader.loadStyle("core/styles/core-application.css");      
  }

  async loaded()
  {
    super.loaded();
    await this.initChilds();
    this.show();
  }

  /*
  * User application booting
  */
  static boot()
  {
      const app = new this("app.js.application");
      window.app = app;

      // if (document.readyState === 'loading')
      //   document.addEventListener('DOMContentLoaded', () => app.loaded());
      // else
        app.loaded();

      // document.fonts.ready.then(() =>
      // {
      //   document.body.classList.add('fonts-loaded');
      // });
  }
}

