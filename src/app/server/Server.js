/**
 * AppCoreJS Framework
 * APP LAYER
 * INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { CoreServer } from '../../core/server/CoreServer.js';
import { UserSearchComponent } from './components/UserSearchComponent.js';

export class Server extends CoreServer
{
    constructor()
    {
        super();
        this.devModeEnabled = true;
        this.registerServerComponent(new UserSearchComponent());
    }
}
