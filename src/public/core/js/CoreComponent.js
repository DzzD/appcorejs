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
        id(this.id).classList.remove('hidden');
    }


    hide()
    {
        console.log(`hide(${this.id})`);
        id(this.id).classList.add('hidden');
    }

}