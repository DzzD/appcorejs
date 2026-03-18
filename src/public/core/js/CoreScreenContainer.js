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
        Loader.loadStyle("core/styles/core-screen-container.css");  
    }

    openScreen(componentId)
    {
        Log.info("opening componentId" + componentId );
        const popup = document.getElementById("popup");
        popup.show();
    }

}