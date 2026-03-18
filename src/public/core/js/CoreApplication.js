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
  loadedStyles;

  constructor(componentId, parent = null)
  {
      super(componentId, parent);
      // this.stylesheets.push("core/styles/application.css");
      this.loadedStyles = new Set();
  }

  async start()
  {
    await this.initChilds();
    
  }

  async _loadStyle(stylesheet)
  {
      const styleUrl = new URL(stylesheet, document.baseURI);
      const href = styleUrl.href;

      Log.info(`Loading style file : ${href}`);

      if (this.loadedStyles.has(href))
      {
          return true;
      }

      const existingLink = document.querySelector(`link[data-appcore-style="${href}"]`);

      if (existingLink)
      {
          this.loadedStyles.add(href);
          return true;
      }

      await new Promise((resolve, reject) =>
      {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = href;
          link.setAttribute("data-appcore-style", href);

          link.onload = resolve;
          link.onerror = reject;

          document.head.appendChild(link);
      });

      this.loadedStyles.add(href);
      return true;
  }

  /*
  * User application booting
  */
  static boot()
  {
      const app = new this("app.js.application");
      window.app = app;

      if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', () => app.start());
      else
        app.start();

      document.fonts.ready.then(() =>
      {
        document.body.classList.add('fonts-loaded');
      });
  }
}

