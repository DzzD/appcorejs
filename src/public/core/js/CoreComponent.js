/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */


export class CoreComponent
{
    /*
     * Component identifier.
     */
    id;
    
    /*
     * Child components.
     */
    childs;

    constructor(componentId)
    {
        this.id = componentId;
        this.childs = new Map();
    }

    show()
    {
        console.log(`show(${this.id})`);
    }

    hide()
    {
        console.log(`hide(${this.id})`);
        id(this.id).classList.add('hidden');
    }

    getHtmlElement()
    {
        const buildSelector = (component) =>
        {
            const selector = `[data-appcore-id="${component.id}"]`;

            return component.parent
                ? `${buildSelector(component.parent)} ${selector}`
                : selector;
        };

        return document.querySelector(buildSelector(this));
    }




    /*
     * Returns the full component representation.
     */
    getContent()
    {
        return {
            type: 'html',
            data: `<div id="${this.id}">${this.getInnerContent().data}</div>`
        };
    }

    /*
     * Returns only the inner component content.
     */
    getInnerContent()
    {
        return {
            type: 'html',
            data: `${this.constructor.name} content`
        };
    }
}