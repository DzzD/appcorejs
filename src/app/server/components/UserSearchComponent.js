/**
 * AppCoreJS Framework
 * APP LAYER
 * SAMPLE SEARCH COMPONENT
 * INTENDED TO BE MODIFIED OR REMOVED
 *
 * This file provides a minimal example to help you get started
 * with server-side search components.
 *
 * It can be freely modified, used as a starting point,
 * or deleted when no longer needed.
 *
 * If deleted, it can be generated again by re-running app-core.
 *
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { SearchComponent } from './SearchComponent.js';
import { DbQueryUserGroupByUser } from '../../db/queries/DbQueryUserGroupByUser.js';


export class UserSearchComponent extends SearchComponent
{
  route = '/api/search/users';

  query = new DbQueryUserGroupByUser();

  criterias = [
    { code: 'login', label: 'Login', sql: 'u.login', type: 'string' },
    { code: 'createdAt', label: 'Créé le', sql: 'u.created_at', type: 'string' },
  ];

  columns = [
    { code: 'id', label: 'ID', object: 'user', alias: 'u', field: 'id' },
    { code: 'login', label: 'Login', object: 'user', alias: 'u', field: 'login' },
    { code: 'createdAt', label: 'Créé le', object: 'user', alias: 'u', field: 'created_at' },
  ];

  order = {
    column: 'login',
    direction: 'asc',
  };

  getSqlWhereForCriteria(criteria, value, criterias, paramIndex)
  {
    if (value === undefined || value === null || value === '')
    {
      return null;
    }

    if (criteria.type === 'string')
    {
      return {
        sql: `${this.getSqlField(criteria)} ILIKE $${paramIndex}`,
        params: [`%${value}%`],
      };
    }

    return super.getSqlWhereForCriteria(criteria, value, criterias, paramIndex);
  }
}