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
    static appcoreCss = "app.styles.stack-component";

    #activeComponentId = null;
    #stackTrack = null;

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

    transitionMode = CoreStackComponent.TransitionMode.SLIDE_X +
                     CoreStackComponent.TransitionMode.SCALE +
                     CoreStackComponent.TransitionMode.FADE;

    transitionDuration = 250;
    transitionMinScale = 0.9;

    async onLoad()
    {
        await super.onLoad();

        this.#stackTrack = this.find(':scope > [data-zone="track"]')
            ?? this.find(":scope > .stack-track")
            ?? this.node;

        this.applyTransitionDuration();

        const firstComponentId = this.childs.keys().next().value;

        if (firstComponentId)
        {
            this.active = firstComponentId;
        }
    }

    onPath(uri = "/")
    {
        const parts = uri.split("/").filter(part => part);
        const componentId = parts.shift();

        if (componentId)
        {
            this.active = componentId;
        }

        const component = this.childs.get(this.active);

        if (component)
        {
            component.onPath("/" + parts.join("/"));
        }
    }

    _getComponentTransform(index, activeIndex)
    {
        const active = index == activeIndex;

        if (this.transitionMode == CoreStackComponent.TransitionMode.DEFAULT)
        {
            return "none";
        }

        let transform = "";

        if (this.transitionMode.includes(CoreStackComponent.TransitionMode.SLIDE_X))
        {
            transform += ` translateX(${index * 100}%)`;
        }

        if (this.transitionMode.includes(CoreStackComponent.TransitionMode.SLIDE_Y))
        {
            transform += ` translateY(${index * 100}%)`;
        }

        if (this.transitionMode.includes(CoreStackComponent.TransitionMode.SCALE))
        {
            transform += ` scale(${active ? "1" : this.transitionMinScale})`;
        }

        if (this.transitionMode.includes(CoreStackComponent.TransitionMode.ROTATE))
        {
            transform += active ? " rotate(0deg)" : (index < activeIndex ? " rotate(-179.9deg)" : " rotate(179.9deg)");
        }

        if (this.transitionMode.includes(CoreStackComponent.TransitionMode.FLIP_X))
        {
            transform += active ? " rotateX(0deg)" : " rotateX(-179.9deg)";
        }

        if (this.transitionMode.includes(CoreStackComponent.TransitionMode.FLIP_Y))
        {
            transform += active ? " rotateY(0deg)" : " rotateY(-179.9deg)";
        }

        return transform.trim() || "none";
    }

    _getStackTransform(index)
    {
        let transform = "";

        if (this.transitionMode.includes(CoreStackComponent.TransitionMode.SLIDE_X))
        {
            transform += ` translateX(${-index * 100}%)`;
        }

        if (this.transitionMode.includes(CoreStackComponent.TransitionMode.SLIDE_Y))
        {
            transform += ` translateY(${-index * 100}%)`;
        }

        return transform.trim() || "none";
    }

    getComponentIndex(componentId)
    {
        let index = 0;

        for (const [id] of this.childs)
        {
            if (id == componentId)
            {
                return index;
            }

            index++;
        }

        return 0;
    }

    showStackComponents(minIndex = 0, maxIndex = Infinity)
    {
        let index = 0;

        for (const [, component] of this.childs)
        {
            const visible = index >= minIndex && index <= maxIndex;

            if (visible)
            {
                component.node.classList.remove("hidden");
                component.node.classList.remove("visible");
                component.node.classList.remove("invisible");
            }
            else
            {
                component.node.classList.add("hidden");
                component.node.classList.add("invisible");
                component.node.classList.remove("visible");
            }

            index++;
        }
    }

    applyFinalStackVisibility(activeIndex)
    {
        let index = 0;

        for (const [, component] of this.childs)
        {
            if (index == activeIndex)
            {
                component.show({ duration: 0 });
            }
            else
            {
                component.hide({ duration: 0 });
            }

            index++;
        }
    }

    applyStackState(activeIndex, enablePointerEvents = true)
    {
        let index = 0;

        for (const [, component] of this.childs)
        {
            const active = activeIndex == index;

            component.node.style.pointerEvents = enablePointerEvents && active ? "auto" : "none";
            component.node.style.opacity = this.transitionMode.includes(CoreStackComponent.TransitionMode.FADE) ? (active ? "1" : "0") : "1";
            component.node.style.transform = this._getComponentTransform(index, activeIndex);

            index++;
        }

        this.#stackTrack.style.transform = this._getStackTransform(activeIndex);
    }

    set active(componentId)
    {
        componentId = appcore(componentId).id;

        if (this.#activeComponentId == componentId)
        {
            return;
        }

        clearTimeout(this.transitionTimeoutId);

        const previousComponentId = this.#activeComponentId;
        this.#activeComponentId = componentId;

        const activeIndex = this.getComponentIndex(componentId);

        if (this.transitionMode == CoreStackComponent.TransitionMode.DEFAULT)
        {
            this.#stackTrack.style.transform = "none";
            this.applyStackState(activeIndex, true);
            this.applyFinalStackVisibility(activeIndex);

            return;
        }

        const previousIndex = this.getComponentIndex(previousComponentId);
        const minIndex = Math.min(previousIndex, activeIndex);
        const maxIndex = Math.max(previousIndex, activeIndex);

        this.showStackComponents(minIndex, maxIndex);
        this.applyStackState(previousIndex, false);

        requestAnimationFrame(() =>
        {
            requestAnimationFrame(() =>
            {
                this.applyStackState(activeIndex, true);

                this.transitionTimeoutId = setTimeout(() =>
                {
                    this.applyFinalStackVisibility(activeIndex);
                }, this.transitionDuration);
            });
        });
    }

    get active()
    {
        return this.#activeComponentId;
    }

    applyTransitionDuration()
    {
        this.#stackTrack.style.transition = `transform ${this.transitionDuration}ms ease, opacity ${this.transitionDuration}ms ease`;

        for (const [, component] of this.childs)
        {
            component.node.style.transition = `transform ${this.transitionDuration}ms ease, opacity ${this.transitionDuration}ms ease`;
        }
    }
}
