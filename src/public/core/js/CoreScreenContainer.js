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
    static appcoreClass = "app.js.screen-container";

    #activeComponentId;

    static TransitionMode =
    {
        DEFAULT: "default",
        SLIDE_X: "slide-x"
    };

    #transitionMode = CoreScreenContainer.TransitionMode.DEFAULT;

    constructor(componentId, parent = null)
    {
        super(componentId, parent);
          
    }
    
    async onLoad()
    {
        await Loader.loadStyle("app/styles/screen-container.css");
        this.active = this.childs.keys().next()?.value;
        // let translateX = 0;
        // for (const element of this.node.findAll('[data-appcore-class~="app.js.screen"]'))
        // {
        //     Log.info(element);
        //     element.style.transform=`translateX(${translateX}%)`;
        //     translateX+=100;
        // }
        // Log.info(this.childs);
    }

    set active(componentId)
    {
        if(this.#activeComponentId == componentId)
        {
            return
        }        
        this.#activeComponentId = componentId;
        
        for (const [id, component] of this.childs)
        {
            if(id == componentId)
            {
                component.show().then(() => {Log.info("opened")});
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

    set transitionMode(value)
    {
        if (!Object.values(CoreScreenContainer.TransitionMode).includes(value))
        {
            Log.warn(`Invalid transition mode: ${value}`);
            return;
        }

        this.#transitionMode = value;
    }


}