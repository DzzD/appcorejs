/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { Component } from "../../app/js/Component.js";


export class CorePopup extends Component
{
    #dragPointerId = null;
    #dragOffsetX = 0;
    #dragOffsetY = 0;

    constructor(componentId, parent = null)
    {
        super(componentId, parent);
        Loader.loadStyle("app/styles/popup.css");
    }

    loaded()
    {
        super.loaded();

        const header = this.node.querySelector(".popup-header");
        header.addEventListener("pointerdown", this.#onDragStart);

        const buttonCross = this.node.querySelector(".popup-header button");
        if(buttonCross)
        {
            buttonCross.addEventListener("pointerdown", (event) =>
            {
                event.stopPropagation();
            });

            buttonCross.addEventListener("click", (event) =>
            {
                this.hide();
            });
        }

        const overlay = this.node.querySelector(".popup-modal-overlay");
        overlay.addEventListener("click", (event) =>
        {
            this.hide();
        });


        const buttonOk = this.node.querySelector(".popup-footer button");
        buttonOk.addEventListener("pointerdown", (event) =>
        {
            event.stopPropagation();
        });
        
        buttonOk.addEventListener("click", (event) =>
        {
            this.hide();
        });

        this.#loadIcon(this.node.dataset.type).then(content => {this.node.querySelector(".popup-icon").innerHTML = content});


        
    }

    async open(args)
    {
        
        this.show(args);
    }

    show(args)
    {
        super.show(args);
        const rect = this.node.getBoundingClientRect();

        this.node.style.left = `${rect.left}px`;
        this.node.style.top = `${rect.top}px`;
        this.node.style.width = `${rect.width}px`;
        this.node.style.right = "";
        this.node.style.bottom = "";
        this.node.style.transform = "none";

        window.addEventListener("resize", this.#onResize);
    }

    hide(args)
    {
        Log.debug(`hidding ${this.id}`);
        super.hide(args);
        window.removeEventListener("resize", this.#onResize);
    }

    async #loadIcon(iconName)
    {
        const response = await fetch(`./assets/icons/${iconName}.svg`);
        const svgText = await response.text();
        return svgText;
    }

    #onDragStart = (event) =>
    {
        const rect = this.node.getBoundingClientRect();

        this.node.style.left = `${rect.left}px`;
        this.node.style.top = `${rect.top}px`;
        this.node.style.width = `${rect.width}px`;
        this.node.style.transform = "none";

        this.#dragPointerId = event.pointerId;
        this.#dragOffsetX = event.clientX - rect.left;
        this.#dragOffsetY = event.clientY - rect.top;

        const header = event.currentTarget;
        header.setPointerCapture(event.pointerId);

        header.addEventListener("pointermove", this.#onDragMove);
        header.addEventListener("pointerup", this.#onDragEnd);
        header.addEventListener("pointercancel", this.#onDragEnd);
    };

    #onDragMove = (event) =>
    {
        this.#setPosition(
            event.clientX - this.#dragOffsetX,
            event.clientY - this.#dragOffsetY
        );
    };

    #onDragEnd = (event) =>
    {
        this.#dragPointerId = null;

        const header = event.currentTarget;
        header.removeEventListener("pointermove", this.#onDragMove);
        header.removeEventListener("pointerup", this.#onDragEnd);
        header.removeEventListener("pointercancel", this.#onDragEnd);
    };

    #onResize = () =>
    {
        const rect = this.node.getBoundingClientRect();
        this.#setPosition(rect.left, rect.top);
    };

    #setPosition(left, top)
    {
        const rect = this.node.getBoundingClientRect();

        const maxLeft = Math.max(0, window.innerWidth - rect.width);
        const maxTop = Math.max(0, window.innerHeight - rect.height);

        const clampedLeft = Math.min(Math.max(0, left), maxLeft);
        const clampedTop = Math.min(Math.max(0, top), maxTop);

        this.node.style.left = `${clampedLeft}px`;
        this.node.style.top = `${clampedTop}px`;
    }
}