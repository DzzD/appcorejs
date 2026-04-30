/**
 * AppCoreJS Framework
 * APP LAYER
 * ONE-SHOT GENERATED FILE
 * INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 *
 * This file can be freely modified.
 * You may add your own rules, methods, or overrides here.
 *
 * If deleted, it can be generated again by re-running app-core.
 *
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { DbQueryObject } from '../DbQueryObject.js';
import { DataUser } from '../models/DataUser.js';
import { DataUserGroup } from '../models/DataUserGroup.js';


export class DbQueryUserGroupByUser extends DbQueryObject
{
    constructor(connectionUid = "default")
    {
        super('appcore', connectionUid);

        this._query =
        `SELECT
            to_jsonb (ug) as ug,
            to_jsonb (u) - 'salt' as u
        FROM
            "user" u
            LEFT JOIN user_group ug on u.id = ug.user_id`;

        this.addDbObject(DataUser, 'user', 'u');
        this.addDbObject(DataUserGroup, 'userGroup', 'ug');
    }


}
