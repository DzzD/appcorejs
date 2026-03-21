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
      Loader.loadStyle("app/styles/application.css");      
  }

  async loaded()
  {
    super.loaded();
    await this.initChilds();
    this.node.querySelector(".application").style.removeProperty("display");
    this._hide(this.node.querySelector(".application-loader"));
    this._show(this.node.querySelector(".application"));
    Log.info("AppCoreJS - Application ready!");

    // this.show();
  }

  /*
  * User application booting
  */
  static boot()
  {
      const app = new this("app.js.application");
      window.app = app;
      app.loaded();
  }
}

