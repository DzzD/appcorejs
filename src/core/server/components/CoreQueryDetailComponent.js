/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { ServerComponent } from '../../../app/server/ServerComponent.js';

export class CoreQueryDetailComponent extends ServerComponent
{
  static TYPES =
  {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    DATE: 'date',
    DATETIME: 'datetime',
    VECTOR: 'vector',
    ENUM: 'enum',
    SELECT: 'select',
  };

  title = null;
  route = null;
  query = null;

  key = 'id';

  groups = [];
  fields = [];
  actions = [];


  start()
  {
    this.startHttp();
  }


  startHttp(route = this.route)
  {
    this.server.application.get(route, async (request, response) =>
    {
      response.json({
        title: this.title,
        groups: this.getFrontGroups(),
        fields: this.getFrontFields(),
        actions: this.getFrontActions(),
        key: this.key,
      });
    });

    this.server.application.post(route, async (request, response) =>
    {
      const result = await this.execute(
        request.body?.action,
        request.body ?? {}
      );

      response.json(result);
    });
  }


  async execute(action, data = {})
  {
    if (action === 'load')
    {
      return this.load(data.key);
    }

    return this.executeAction(action, data);
  }


  async executeAction(action, data = {})
  {
    return {
      action,
      error: 'Unknown action',
    };
  }


  async load(key)
  {
    const where = this.getSqlWhereForKey(key);

    await this.query.search(where.sql, where.params, {
      limit: 1,
    });

    let record = null;

    if (await this.query.next())
    {
      record = this.resultRecord();
    }

    return {
      action: 'load',
      title: this.title,
      groups: this.getFrontGroups(),
      fields: this.getFrontFields(),
      actions: this.getFrontActions(),
      key: this.key,
      record,
    };
  }


  getSqlWhereForKey(value)
  {
    return {
      sql: `${this.quoteSqlIdentifier(this.key)} = $1`,
      params: [value],
    };
  }


  getFrontGroups()
  {
    return this.groups.map((group) => ({
      code: group.code,
      label: group.label,
    }));
  }


  getFrontFields()
  {
    return this.fields.map((field) => ({
      code: field.code,
      label: field.label,
      type: field.type ?? null,
      group: field.group ?? null,
      readonly: field.readonly ?? false,
      required: field.required ?? false,
      options: field.options ?? [],
    }));
  }


  getFrontActions()
  {
    return this.actions;
  }


  resultRecord()
  {
    const record = {};

    for (const field of this.fields)
    {
      record[field.code] = this.resultField(field);
    }

    return record;
  }


  resultField(field)
  {
    return this.query.getFieldValue(field.code, field.object);
  }


  quoteSqlIdentifier(name)
  {
    return `"${String(name).replaceAll('"', '""')}"`;
  }
}