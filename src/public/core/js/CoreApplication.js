/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { Component } from "../../app/js/Component.js";
import { Log } from '../../app/js/Log.js';

globalThis.$ = globalThis.id = (id) => { return document.getElementById(id) };
globalThis.select = (selector) => { return document.querySelector(selector) };
globalThis.selectAll = (selector, parent = document) => { return [...parent.querySelectorAll(selector)] };
globalThis.Log = Log;
Log.mode = "debug";




export class CoreApplication extends Component
{
  components;
  _screenCurrentId;
  _screenPreviousId;

  async start()
  {
    
    // Log.error("errreur");
    this.components = new Map();
    this.id = "app.js.application";
    console.log(this.node);
    console.log(this.extractTemplate());
    await this.initChildComponents();
    
  }

  /*
  * User application booting
  */
  static boot()
  {
    const app = new this(); 
    window.app = app;

    if (document.readyState === 'loading')
      document.addEventListener('DOMContentLoaded', app.start);
    else
      app.start();

    document.fonts.ready.then(() =>
    {
      document.body.classList.add('fonts-loaded');
    });
  }
}

