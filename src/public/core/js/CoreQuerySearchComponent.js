/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { Component } from "../../app/js/Component.js";

export class CoreQuerySearchComponent extends Component
{
  static appcoreClass = "app.js.query-search-component";

  route = null;
  title = "Recherche";

  criterias = [];
  columns = [];
  actions = [];
  rows = null;

  orderState = {
    column: null,
    direction: "asc",
  };

  searchRecordCount = 0;
  resultSizeMin = 30;
  resultSize = 30;
  resultSizeIncrement = 30;
  scrollPreloadMargin = 100;

  isSearching = false;
  hasPendingSearch = false;


  async onLoad()
  {
    await super.onLoad();
    await Loader.loadStyle("app/styles/query-search-component.css");

    await this.loadDefinition();
    await this.render();
    this.bindResultScroll();

    await this.action("search");
  }


  async render()
  {
    this.find('[data-zone="title"]').textContent = this.title;

    await Component.setInnerHtml(this.find('[data-zone="criterias"]'), `
      ${this.criterias.map((criteria) => this.renderCriteria(criteria)).join("")}
    `);

    for (const input of this.findAll('[data-zone="criterias"] [name]'))
    {
      input.addEventListener("input", async () => await this.action("search"));
      input.addEventListener("change", async () => await this.action("search"));
    }

    await this.renderActions();
  }


  bindResultScroll()
  {
    this.find('[data-zone="result"]').addEventListener("scroll", async () => await this.onResultScroll());
  }


  async onResultScroll()
  {
    if (!this.rows?.length)
    {
      return;
    }

    if (!this.canLoadMoreResult())
    {
      return;
    }

    const result = this.find('[data-zone="result"]');
    const bottomPosition = result.scrollTop + result.clientHeight + this.scrollPreloadMargin;

    if (result.scrollHeight !== 0 && bottomPosition >= result.scrollHeight)
    {
      await this.action("loadMoreResult");
    }
  }


  canLoadMoreResult()
  {
    return !this.isSearching && this.rows.length < this.searchRecordCount;
  }


  renderCriteria(criteria)
  {
    if (criteria.type === "select")
    {
      return `
        <label>
          <span>${criteria.label}</span>

          <div data-appcore-id="app.js.select-component::criteria-${criteria.code}"
               data-template="app.tpl.select-component"
               data-placeholder="${criteria.label}"
               name="${criteria.code}">

            <div data-zone="options">
              ${criteria.options.map((option) => `
                <div value="${option.value}">${option.label}</div>
              `).join("")}
            </div>
          </div>
        </label>
      `;
    }

    return `
      <label>
        <span>${criteria.label}</span>
        <input name="${criteria.code}" type="text">
      </label>
    `;
  }


  getCriterias()
  {
    const values = {};

    for (const criteria of this.criterias)
    {
      const input = this.find(`[data-zone="criterias"] [name="${criteria.code}"]`);

      if (!input)
      {
        continue;
      }

      values[criteria.code] = input.value;
    }

    return values;
  }


  getOptions()
  {
    return {
      order: this.orderState,
      resultSize: this.resultSize,
    };
  }


  async search(args = null)
  {
    return this.runSearch("search");
  }


  async order(args = {})
  {
    const column = args.column;

    this.orderState = {
      column,
      direction:
        this.orderState.column === column && this.orderState.direction === "asc"
          ? "desc"
          : "asc",
    };

    return this.runSearch("order");
  }


  async loadMoreResult(args = null)
  {
    return this.runSearch("loadMoreResult");
  }


  async runSearch(actionName = "search")
  {
    if (this.isSearching && actionName === "search")
    {
      this.hasPendingSearch = true;
      return;
    }

    if (this.isSearching)
    {
      return;
    }

    if (actionName === "search" || actionName === "order")
    {
      this.resultSize = this.resultSizeMin;
      this.rows = null;
      this.find('[data-zone="result"]').scrollTop = 0;
    }

    if (actionName === "loadMoreResult")
    {
      this.resultSize += this.resultSizeIncrement;
    }

    this.isSearching = true;

    try
    {
      const response = await fetch(this.route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          criterias: this.getCriterias(),
          options: this.getOptions(),
        }),
      });

      const result = await response.json();

      this.resultSize = result.resultSize ?? this.resultSize;
      this.resultSizeMin = result.resultSizeMin ?? this.resultSizeMin;
      this.resultSizeIncrement = result.resultSizeIncrement ?? this.resultSizeIncrement;
      this.searchRecordCount = result.searchRecordCount ?? this.searchRecordCount;
      this.orderState = result.order ?? this.orderState;
      this.rows = result.rows ?? [];

      await this.renderResult();
    }
    finally
    {
      this.isSearching = false;

      if (this.hasPendingSearch)
      {
        this.hasPendingSearch = false;
        await this.action("search");
      }

      await this.onResultScroll();
    }
  }

  get visibleColumns()
  {
      return this.columns.filter((column) => column.visible !== false);
  }


  async renderResult()
  {
      await Component.setInnerHtml(this.find('[data-zone="result"]'), `
          <div class="query-search-result">
              ${this.renderHeaderRow()}
              ${this.rows.map((row, index) => this.renderRow(row, index)).join("")}
          </div>
      `);

      this.bindHeaderColumns();
      this.bindRows();
      await this.renderFooter();
  }


  renderHeaderRow()
  {
      return `
        <div class="query-search-result-row query-search-result-header">
          ${this.visibleColumns.map((column) => this.renderHeaderColumn(column)).join("")}
        </div>
      `;
  }


  bindHeaderColumns()
  {
    for (const header of this.findAll('[data-zone="result"] [data-column][data-sortable="true"]'))
    {
      this.bindHeaderColumn(header);
    }
  }


  bindHeaderColumn(header)
  {
    header.addEventListener("click", async () => await this.action("order", {
      column: header.dataset.column,
    }));
  }

  bindRows()
  {
      for (const rowNode of this.findAll('[data-zone="result"] .query-search-result-row[data-row-index]'))
      {
          rowNode.addEventListener("click", async () =>
          {
              await this.action("rowClick", {
                  row: this.rows[rowNode.dataset.rowIndex],
              });
          });
      }
  }

  onRowClick(row)
  {
  }

  getColumn(code)
  {
    return this.columns.find((column) => column.code === code);
  }


  renderHeaderColumn(column)
  {
    const isSortable = column.sortable !== false;
    const isOrdered = this.orderState.column === column.code;
    const direction = this.orderState.direction;
    const style = column.width ? ` style="width: ${column.width};"` : "";

    return `
      <div class="query-search-result-cell query-search-result-header-cell"
        data-column="${column.code}"
        data-sortable="${isSortable}"${style}>
        ${column.label}
        ${isOrdered ? `<span class="sort-indicator">${direction === "desc" ? "▼" : "▲"}</span>` : ""}
      </div>
    `;
  }


  async orderBy(column)
  {
    return await this.action("order", {
      column,
    });
  }


  renderRow(row, index)
  {
      return `
          <div class="query-search-result-row" data-row-index="${index}">
              ${this.visibleColumns.map((column) => this.renderField(row, column, index)).join("")}
          </div>
      `;
  }


  renderField(row, column)
  {
    return `
      <div class="query-search-result-cell" data-label="${column.label}">
        ${row[column.code] ?? ""}
      </div>
    `;
  }


  async renderFooter()
  {
    const count = this.searchRecordCount;

    await Component.setInnerHtml(this.find('[data-zone="footer"]'), `
        <div class="query-search-footer-count">
            ${count > 1 ? `${count} results found` : `${count} result found`}
        </div>
    `);
  }

  async renderActions()
  {
      const actionsZone = this.find('[data-zone="actions"]');

      if (!actionsZone)
      {
          return;
      }

      if (!Array.isArray(this.actions) || this.actions.length === 0)
      {
          await Component.setInnerHtml(actionsZone, "");
          return;
      }

      await Component.setInnerHtml(actionsZone, `
          <div data-appcore-id="app.js.action-bar-component::query-search-actions-bar"
               data-template="app.tpl.action-bar-component">
          </div>
      `);

      const actionBar = this.getChild("query-search-actions-bar");

      if (!actionBar)
      {
          return;
      }

      for (const action of this.actions)
      {
          actionBar.add(action);
      }
  }  


  async loadDefinition()
  {
    const response = await fetch(this.route);
    const result = await response.json();

    this.title = result.title ?? this.title;
    this.criterias = result.criterias ?? [];
    this.columns = result.columns ?? [];
    this.actions = result.actions ?? [];
    this.orderState = result.order ?? { column: null, direction: "asc" };
    this.resultSizeMin = result.resultSizeMin ?? this.resultSizeMin;
    this.resultSize = this.resultSizeMin;
    this.resultSizeIncrement = result.resultSizeIncrement ?? this.resultSizeIncrement;
  }

  async action(name, args = null)
  {
      switch (name)
      {
          case "search":
          {
              return await this.search(args);
          }

          case "order":
          {
              return await this.order(args);
          }

          case "loadMoreResult":
          {
              return await this.loadMoreResult(args);
          }

          case "rowAction":
          {
              console.log(args.action, args.row);
              return;
          }

          case "rowClick":
          {
              return await this.onRowClick(args.row);
          }

          default:
          {
              return await super.action(name, args);
          }
      }
  }

  executeAction(action)
  {
      console.log(action);
  }  
}
