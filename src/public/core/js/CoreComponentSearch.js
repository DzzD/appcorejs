/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { Component } from "../../app/js/Component.js";

export class CoreComponentSearch extends Component
{
  static appcoreClass = "app.js.component-search";

  route = null;
  title = "Recherche";

  criterias = [];
  columns = [];
  actions = [];

  order = {
    column: null,
    direction: "asc",
  };

  limit = null;


  async onLoad()
  {
    await super.onLoad();
    await Loader.loadStyle("app/styles/component-search.css");

    await this.loadDefinition();
    this.render();
  }


  render()
  {
    this.find(".title").textContent = this.title;

    this.find(".criterias").innerHTML = `
      ${this.criterias.map((criteria) => this.renderCriteria(criteria)).join("")}
      <button type="button" data-action="search">Rechercher</button>
    `;

    this.find('[data-action="search"]').addEventListener("click", () => this.search());
  }


  renderCriteria(criteria)
  {
    return `
      <label>
        <span>${criteria.label}</span>
        <input type="search" name="${criteria.code}" autocomplete="off">
      </label>
    `;
  }


  getCriterias()
  {
    const values = {};

    for (const criteria of this.criterias)
    {
      values[criteria.code] = this.find(`[name="${criteria.code}"]`)?.value ?? "";
    }

    return values;
  }


  getOptions()
  {
    return {
      order: this.order,
      limit: this.limit,
    };
  }


  async search()
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

    this.renderResult(result);
  }


  renderResult(result)
  {
    const rows = result.rows ?? [];

    this.find(".result").innerHTML = `
      <table class="table">
        <thead>
          <tr>
            ${this.columns.map((column) => `<th>${column.label}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => this.renderRow(row)).join("")}
        </tbody>
      </table>
    `;

    this.renderFooter(result, rows);
  }


  renderRow(row)
  {
    return `
      <tr>
        ${this.columns.map((column) => this.renderField(row, column)).join("")}
      </tr>
    `;
  }


  renderField(row, column)
  {
    return `<td>${row[column.code] ?? ""}</td>`;
  }


  renderFooter(result, rows)
  {
    const count = result.count ?? result.total ?? rows.length;

    this.find(".footer").textContent =
      count > 1
        ? `${count} results found`
        : `${count} result found`;
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
    this.limit = result.limit ?? null;
  }
}