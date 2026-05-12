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

  order = {
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

    await this.search("search");
  }


  async render()
  {
    this.find(".title").textContent = this.title;

    await Component.setInnerHtml(this.find(".criterias"), `
      ${this.criterias.map((criteria) => this.renderCriteria(criteria)).join("")}
    `);

    for (const input of this.findAll(".criterias [name]"))
    {
      input.addEventListener("input", () => this.search("search"));
      input.addEventListener("change", () => this.search("search"));
    }
  }


  bindResultScroll()
  {
    this.find(".result").addEventListener("scroll", () => this.onResultScroll());
  }


  onResultScroll()
  {
    if (!this.rows?.length)
    {
      return;
    }

    if (!this.canLoadMoreResult())
    {
      return;
    }

    const result = this.find(".result");
    const bottomPosition = result.scrollTop + result.clientHeight + this.scrollPreloadMargin;

    if (result.scrollHeight !== 0 && bottomPosition >= result.scrollHeight)
    {
      this.search("loadMoreResult");
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
      const input = this.find(`.criterias [name="${criteria.code}"]`);

      values[criteria.code] = input.value;
    }

    return values;
  }


  getOptions()
  {
    return {
      order: this.order,
      resultSize: this.resultSize,
    };
  }


  async search(action = "search")
  {
    if (this.isSearching && action === "search")
    {
      this.hasPendingSearch = true;
      return;
    }

    if (this.isSearching)
    {
      return;
    }

    if (action === "search" || action === "order")
    {
      this.resultSize = this.resultSizeMin;
      this.rows = null;
      this.find(".result").scrollTop = 0;
    }

    if (action === "loadMoreResult")
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
      this.order = result.order ?? this.order;
      this.rows = result.rows ?? [];

      await this.renderResult();
    }
    finally
    {
      this.isSearching = false;

      if (this.hasPendingSearch)
      {
        this.hasPendingSearch = false;
        this.search("search");
      }

      this.onResultScroll();
    }
  }

  get visibleColumns()
  {
      return this.columns.filter((column) => column.visible !== false);
  }


  async renderResult()
  {
      await Component.setInnerHtml(this.find(".result"), `
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
    for (const header of this.findAll('.result [data-column][data-sortable="true"]'))
    {
      this.bindHeaderColumn(header);
    }
  }


  bindHeaderColumn(header)
  {
    header.addEventListener("click", () => this.orderBy(header.dataset.column));
  }

  bindRows()
  {
      for (const rowNode of this.findAll(".result .query-search-result-row[data-row-index]"))
      {
          rowNode.addEventListener("click", () =>
          {
              this.onRowClick(this.rows[rowNode.dataset.rowIndex]);
          });
      }
  }

  onRowClick(row)
  {
  }



  executeRowAction(action, row)
  {
    console.log(action, row);
  }


  getColumn(code)
  {
    return this.columns.find((column) => column.code === code);
  }


  renderHeaderColumn(column)
  {
    const isSortable = column.sortable !== false;
    const isOrdered = this.order?.column === column.code;
    const direction = this.order?.direction ?? "asc";
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


  orderBy(column)
  {
    this.order = {
      column,
      direction:
        this.order?.column === column && this.order?.direction === "asc"
          ? "desc"
          : "asc",
    };

    this.search("order");
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

      await Component.setInnerHtml(this.find(".footer"), `
          <div class="query-search-footer-count">
              ${count > 1 ? `${count} results found` : `${count} result found`}
          </div>

          <div class="query-search-footer-actions">
              ${this.actions.map((action) => this.renderAction(action)).join("")}
          </div>
      `);

      this.bindActions();
  }


  async loadDefinition()
  {
    const response = await fetch(this.route);
    const result = await response.json();

    this.title = result.title ?? this.title;
    this.criterias = result.criterias ?? [];
    this.columns = result.columns ?? [];
    this.actions = result.actions ?? [];
    this.order = result.order ?? { column: null, direction: "asc" };
    this.resultSizeMin = result.resultSizeMin ?? this.resultSizeMin;
    this.resultSize = this.resultSizeMin;
    this.resultSizeIncrement = result.resultSizeIncrement ?? this.resultSizeIncrement;
  }

  renderAction(action)
  {
      return `
          <button type="button" data-action="${action.code}">
              ${action.label}
          </button>
      `;
  }


  bindActions()
  {
      for (const button of this.findAll(".footer [data-action]"))
      {
          button.addEventListener("click", () => this.executeAction(button.dataset.action));
      }
  }


  executeAction(action)
  {
      console.log(action);
  }  
}