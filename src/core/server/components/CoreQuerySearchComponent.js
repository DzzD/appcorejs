/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { ServerComponent } from '../../../app/server/ServerComponent.js';

export class CoreQuerySearchComponent extends ServerComponent
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

  static OPERATORS =
  {
    EQUALS: '=',
    CONTAINS: 'contains',
    STARTS_WITH: 'starts_with',
    GREATER: '>',
    LOWER: '<',
    GREATER_EQUALS: '>=',
    LOWER_EQUALS: '<='
  };

  title = null;
  route = null;
  query = null;

  criterias = [];
  columns = [];
  actions = [];

  order = {
    column: null,
    direction: 'asc',
  };

  resultSizeMin = 30;
  resultSizeIncrement = 30;


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
        criterias: this.getFrontCriterias(),
        columns: this.getFrontColumns(),
        actions: this.getFrontActions(),
        order: this.order,
        resultSizeMin: this.resultSizeMin,
        resultSizeIncrement: this.resultSizeIncrement,
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
    const resultSize = this.getResultSize(options.resultSize);

    const searchRecordCount = await this.query.recordCountAll(
      where.sql,
      where.params
    );

    await this.query.search(where.sql, where.params, {
      order,
      limit: resultSize,
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
      resultSize,
      resultSizeMin: this.resultSizeMin,
      resultSizeIncrement: this.resultSizeIncrement,
      searchRecordCount,
      rows,
    };
  }


  getResultSize(resultSize = null)
  {
    const size = Number(resultSize ?? this.resultSizeMin);

    if (!Number.isFinite(size))
    {
      return this.resultSizeMin;
    }

    return Math.max(this.resultSizeMin, size);
  }


  getFrontCriterias()
  {
    return this.criterias.map((criteria) => ({
      code: criteria.code,
      label: criteria.label,
      type: criteria.type ?? null,
      operator: criteria.operator ?? this.constructor.OPERATORS.EQUALS,
      options: criteria.options ?? []
    }));
  }


  getFrontColumns()
  {
    return this.columns.map((column) => ({
        code: column.code,
        label: column.label,
        type: column.type ?? null,
        visible: column.visible ?? true,
        sortable: column.sortable ?? true,
        width: column.width ?? null,
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

    const field = this.getSqlField(criteria);
    const operator = criteria.operator ?? this.constructor.OPERATORS.EQUALS;

    if (operator === this.constructor.OPERATORS.CONTAINS)
    {
      return {
        sql: `${field}::text ILIKE $${paramIndex}`,
        params: [`%${value}%`],
      };
    }

    if (operator === this.constructor.OPERATORS.STARTS_WITH)
    {
      return {
        sql: `${field}::text ILIKE $${paramIndex}`,
        params: [`${value}%`],
      };
    }

    if (operator === this.constructor.OPERATORS.GREATER)
    {
      return {
        sql: `${field} > $${paramIndex}`,
        params: [value],
      };
    }

    if (operator === this.constructor.OPERATORS.LOWER)
    {
      return {
        sql: `${field} < $${paramIndex}`,
        params: [value],
      };
    }

    if (operator === this.constructor.OPERATORS.GREATER_EQUALS)
    {
      return {
        sql: `${field} >= $${paramIndex}`,
        params: [value],
      };
    }

    if (operator === this.constructor.OPERATORS.LOWER_EQUALS)
    {
      return {
        sql: `${field} <= $${paramIndex}`,
        params: [value],
      };
    }

    return {
      sql: `${field} = $${paramIndex}`,
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
      return `${this.quoteSqlIdentifier(item.alias)}.${this.quoteSqlIdentifier(item.field)}`;
    }

    return this.quoteSqlIdentifier(item.field ?? item.code);
  }


  quoteSqlIdentifier(name)
  {
    return `"${String(name).replaceAll('"', '""')}"`;
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
    return this.query.getFieldValue(column.code, column.object);
  }
}