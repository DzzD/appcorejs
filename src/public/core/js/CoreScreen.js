/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { Component } from "../../app/js/Component.js";


export class CoreScreen extends Component
{
    constructor(componentId, parent = null)
    {
        super(componentId, parent);
        Loader.loadStyle("app/styles/screen.css");  
    }
}