/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { Component } from "../../app/js/Component.js";


export class CoreScreenContainer extends Component
{
    constructor(componentId, parent = null)
    {
        super(componentId, parent);
        Loader.loadStyle("app/styles/screen-container.css");  
    }
    
    loaded()
    {
        super.loaded();
        let translateX = 0;
        for (const element of this.node.querySelectorAll('[data-appcore-class~="app.js.screen"]'))
        {
            Log.info(element);
            element.style.transform=`translateX(${translateX}%)`;
            translateX+=100;
        }
    }

    openScreen(componentId)
    {
        Log.debug("opening componentId" + componentId );
        const popup = document.getElementById("popup");
        popup.show();
    }

}