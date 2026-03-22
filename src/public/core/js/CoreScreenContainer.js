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
    #activeComponentId;

    constructor(componentId, parent = null)
    {
        super(componentId, parent);
          
    }
    
    async onLoad()
    {
        await Loader.loadStyle("app/styles/screen-container.css");
        this.active = this.childs.keys().next().value;
        // let translateX = 0;
        // for (const element of this.node.querySelectorAll('[data-appcore-class~="app.js.screen"]'))
        // {
        //     Log.info(element);
        //     element.style.transform=`translateX(${translateX}%)`;
        //     translateX+=100;
        // }
        Log.info(this.childs);
    }

    set active(componentId)
    {
        Log.info(componentId);
        this.#activeComponentId = componentId;
        for (const [id, component] of this.childs)
        {
            if(id == componentId)
            {
                component.show();
            }          
            else
            {
                component.hide();
            }  
        }
    }

    get active()
    {
        return this.#activeComponentId;
    }

    // set active(
    // openScreen(componentId)
    // {
    //     Log.debug("opening componentId" + componentId );
    //     const popup = document.getElementById("popup");
    //     popup.show();
    // }

}