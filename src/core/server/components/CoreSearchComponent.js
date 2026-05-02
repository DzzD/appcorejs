/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { ServerComponent } from '../../../app/server/ServerComponent.js';

export class CoreSearchComponent extends ServerComponent
{
  route = null;
  query = null;

  criterias = [];
  columns = [];
  actions = [];

  order = {
    column: null,
    direction: 'asc',
  };

  limit = null;


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
        criterias: this.criterias,
        columns: this.columns,
        actions: this.actions,
        order: this.order,
        limit: this.limit,
      });
    });

    this.server.application.post(route, async (request, response) =>
    {
      const result = await this.search(
        request.body?.criterias ?? {},
        request.body?.options ?? {}
      );

      response.json(result);
    });
  }

  async search(criterias = {}, options = {})
  {
    const where = this.getSqlWhere(criterias);
    const order = this.getSqlOrder(options.order ?? this.order);
    const limit = this.getSqlLimit(options.limit ?? this.limit);

    await this.query.search(where.sql, where.params, {
      order,
      limit,
    });

    const rows = [];

    while (await this.query.next())
    {
      rows.push(this.resultRow());
    }

    return {
      criterias: this.getFrontCriterias(),
      columns: this.getFrontColumns(),
      actions: this.getFrontActions(),
      order: options.order ?? this.order,
      limit: options.limit ?? this.limit,
      rows,
    };
  }


  getFrontCriterias()
  {
    return this.criterias.map((criteria) => ({
      code: criteria.code,
      label: criteria.label,
      type: criteria.type ?? null,
    }));
  }


  getFrontColumns()
  {
    return this.columns.map((column) => ({
      code: column.code,
      label: column.label,
      type: column.type ?? null,
    }));
  }


  getFrontActions()
  {
    return this.actions;
  }


  getSqlWhere(criterias = {})
  {
    const sql = [];
    const params = [];

    for (const criteria of this.criterias)
    {
      const where = this.getSqlWhereForCriteria(
        criteria,
        criterias[criteria.code],
        criterias,
        params.length + 1
      );

      if (!where)
      {
        continue;
      }

      if (where.sql)
      {
        sql.push(where.sql);
      }

      if (Array.isArray(where.params))
      {
        params.push(...where.params);
      }
    }

    return {
      sql: sql.join(' AND '),
      params,
    };
  }


  getSqlWhereForCriteria(criteria, value, criterias, paramIndex)
  {
    if (value === undefined || value === null || value === '')
    {
      return null;
    }

    return {
      sql: `${this.getSqlField(criteria)} = $${paramIndex}`,
      params: [value],
    };
  }


  getSqlField(item)
  {
    if (item.sql)
    {
      return item.sql;
    }

    if (item.alias && item.field)
    {
      return `${item.alias}.${item.field}`;
    }

    return item.field ?? item.code;
  }


  getSqlOrder(order = null)
  {
    if (!order?.column)
    {
      return null;
    }

    const column = this.columns.find((column) => column.code === order.column);

    if (!column)
    {
      return null;
    }

    const direction = order.direction === 'desc' ? 'DESC' : 'ASC';

    return `${this.getSqlField(column)} ${direction}`;
  }


  getSqlLimit(limit = null)
  {
    if (limit === null || limit === undefined || limit === '')
    {
      return null;
    }

    const parsedLimit = Number(limit);

    if (!Number.isInteger(parsedLimit) || parsedLimit <= 0)
    {
      return null;
    }

    return parsedLimit;
  }


  resultRow()
  {
    const row = {};

    for (const column of this.columns)
    {
      row[column.code] = this.resultField(column);
    }

    return row;
  }


  resultField(column)
  {
    if (column.object)
    {
      return this.query[column.object]?.[column.code] ?? null;
    }

    return this.query[column.code] ?? null;
  }
}