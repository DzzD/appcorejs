/**
 * AppCoreJS Framework
 * APP LAYER
 * INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { CoreApplication } from "../../core/js/CoreApplication.js";

export class Application extends CoreApplication
{
  /*
  * Called once after boot(), when everything loaded 
  */
  start()
  {
    super.start();
  }

  async open(componentId, args = null)
  {
    await super.open(componentId);
    
    switch(componentId)
    {
  

    }

  }

  async close(componentId, args = null)
  {
    await super.close(componentId);
    
    switch(componentId)
    {
  

    }
  }
}

Application.boot();
