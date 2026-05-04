/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { Component } from "../../app/js/Component.js";

export class CoreStackComponent extends Component
{
    static appcoreClass = "app.js.stack-component";

    #activeComponentId = null;

    static TransitionMode =
    {
        DEFAULT: "default",
        FADE: "fade",
        SCALE: "scale",
        SLIDE_X: "slide-x",
        SLIDE_Y: "slide-y",
        ROTATE: "rotate",
        FLIP_X: "flip-x",
        FLIP_Y: "flip-y"
    };

    #transitionMode = CoreStackComponent.TransitionMode.SLIDE_X + 
                      CoreStackComponent.TransitionMode.SCALE +                      
                      CoreStackComponent.TransitionMode.FADE;

    #transitionDuration = 1000;
    #transitionMinScale = 0.5;

    constructor(componentId, parent = null)
    {
        super(componentId, parent);
    }

    async onLoad()
    {
        super.onLoad();
        await Loader.loadStyle("app/styles/stack-component.css");

        if (this.node.dataset.transitionMode)
        {
            this.#transitionMode = this.node.dataset.transitionMode;
        }

        if (this.node.dataset.transitionDuration)
        {
            this.#transitionDuration = Number(this.node.dataset.transitionDuration);
        }

        if (this.node.dataset.transitionMinScale)
        {
            this.#transitionMinScale = Number(this.node.dataset.transitionMinScale);
        }

        // for (const [, component] of this.childs)
        // {
        //     component.node.style.transformOrigin = "center center";
        //     component.node.style.backfaceVisibility = "hidden";
        //     component.node.style.webkitBackfaceVisibility = "hidden";
        //     component.node.style.transformStyle = "preserve-3d";
        // }

        this.transitionDuration = this.#transitionDuration;

        const firstComponentId = this.childs.keys().next().value;

        if (firstComponentId)
        {
            this.active = firstComponentId;
        }
    }


    _getComponentTransform(index, activeIndex)
    {
        const active = index == activeIndex;

        if (this.#transitionMode == CoreStackComponent.TransitionMode.DEFAULT)
        {
            return "none";
        }

        let transform = "";

        if (this.#transitionMode.includes(CoreStackComponent.TransitionMode.SLIDE_X))
        {
            transform += ` translateX(${index * 100}%)`;
        }

        if (this.#transitionMode.includes(CoreStackComponent.TransitionMode.SLIDE_Y))
        {
            transform += ` translateY(${index * 100}%)`;
        }

        if (this.#transitionMode.includes(CoreStackComponent.TransitionMode.SCALE))
        {
            transform += ` scale(${active ? "1" : this.#transitionMinScale})`;
        }

        if (this.#transitionMode.includes(CoreStackComponent.TransitionMode.ROTATE))
        {
            if (active)
            {
                transform += ` rotate(0deg)`;
            }
            else
            {
                transform += (index < activeIndex) ? ` rotate(-179.9deg)` : ` rotate(179.9deg)`;
            }
        }

        if (this.#transitionMode.includes(CoreStackComponent.TransitionMode.FLIP_X))
        {
            if (active)
            {
                transform += ` rotateX(0deg)`;
            }
            else
            {
                transform += ` rotateX(-179.9deg)`;
            }
        }

        if (this.#transitionMode.includes(CoreStackComponent.TransitionMode.FLIP_Y))
        {
            if (active)
            {
                transform += ` rotateY(0deg)`;
            }
            else
            {
                transform += ` rotateY(-179.9deg)`;
            }
        }

        return transform.trim() || "none";
    }

    _getStackTransform(index)
    {
        let transform = "";

        if (this.#transitionMode.includes(CoreStackComponent.TransitionMode.SLIDE_X))
        {
            transform += ` translateX(${-index * 100}%)`;
        }

        if (this.#transitionMode.includes(CoreStackComponent.TransitionMode.SLIDE_Y))
        {
            transform += ` translateY(${-index * 100}%)`;
        }

        return transform.trim() || "none";
    }

    set transitionMinScale(transitionMinScale)
    {
        this.#transitionMinScale = transitionMinScale;
    }

    set active(componentId)
    {
        componentId = appcore(componentId).id;

        if (this.#activeComponentId == componentId)
        {
            return;
        }

        this.#activeComponentId = componentId;

        if (this.#transitionMode == CoreStackComponent.TransitionMode.DEFAULT)
        {
            this.node.style.transform = "none";

            for (const [id, component] of this.childs)
            {
                if (id == componentId)
                {
                    component.show();
                }
                else
                {
                    component.hide();
                }
            }

            return;
        }

        let index = 0;
        let activeIndex = 0;

        for (const [id] of this.childs)
        {
            if (this.#activeComponentId == id)
            {
                activeIndex = index;
            }

            index++;
        }

        index = 0;

        for (const [, component] of this.childs)
        {
            const active = activeIndex == index;

            // component.show();
            component.node.classList.remove("hidden");
            component.node.classList.remove("visible");
            component.node.style.pointerEvents = active ? "auto" : "none";
            component.node.style.opacity = this.#transitionMode.includes(CoreStackComponent.TransitionMode.FADE) ? (active ? "1" : "0") : "1";
            component.node.style.transform = this._getComponentTransform(index, activeIndex);

            index++;
        }

        this.node.style.transform = this._getStackTransform(activeIndex);
    }

    get active()
    {
        return this.#activeComponentId;
    }

    set transitionMode(value)
    {
        this.#transitionMode = value;
    }

    set transitionDuration(value)
    {
        this.#transitionDuration = value;

        this.node.style.transition = `transform ${this.#transitionDuration}ms ease, opacity ${this.#transitionDuration}ms ease`;

        for (const [, component] of this.childs)
        {
            component.node.style.transition = `transform ${this.#transitionDuration}ms ease, opacity ${this.#transitionDuration}ms ease`;
        }
    }
}
