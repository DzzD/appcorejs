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
    static appcoreClass = "app.js.screen";
    static appcoreCss = "app.css.screen";

    constructor(componentId, parent = null)
    {
        super(componentId, parent);        
}

    async onLoad()
    {
        super.onLoad();
    }
}