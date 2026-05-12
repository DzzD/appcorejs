/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { Component } from "../../app/js/Component.js";

export class CoreQueryDetailComponent extends Component
{
    static appcoreClass = "app.js.query-detail-component";

    route = null;
    title = "Détail";
    key = null;

    groups = [];
    fields = [];
    actions = [];
    record = null;


    async onLoad()
    {
        await super.onLoad();
        await Loader.loadStyle("app/styles/query-detail-component.css");

        await this.loadDefinition();
        await this.render();

        if (this.key)
        {
            await this.executeAction("load");
        }
    }


    async loadDefinition()
    {
        const response = await fetch(this.route);
        const result = await response.json();

        this.title = result.title ?? this.title;
        this.groups = result.groups ?? [];
        this.fields = result.fields ?? [];
        this.actions = result.actions ?? [];
    }


    async render()
    {
        this.find('[data-zone="title"]').textContent = this.title;

        await Component.setInnerHtml(this.find('[data-zone="groups"]'), `
            ${this.groups.map((group) => this.renderGroup(group)).join("")}
        `);

        await Component.setInnerHtml(this.find('[data-zone="footer"]'), `
            ${this.actions.map((action) => this.renderAction(action)).join("")}
        `);

        this.bindActions();
    }


    renderGroup(group)
    {
        return `
            <fieldset class="query-detail-group" data-group="${group.code}">
                <legend>${group.label}</legend>

                <div class="query-detail-group-content">
                    ${this.getGroupFields(group).map((field) => this.renderField(field)).join("")}
                </div>
            </fieldset>
        `;
    }

    getGroupFields(group)
    {
        return this.fields.filter((field) => field.group === group.code);
    }


    renderField(field)
    {
        if (field.type === "select")
        {
            const options = Array.isArray(field.options)
                ? field.options
                : [];

            return `
                <label class="query-detail-field">
                    <span>${field.label}</span>

                    <div data-appcore-id="app.js.select-component::field-${field.code}"
                         data-template="app.tpl.select-component"
                         data-placeholder="${field.label}"
                         name="${field.code}">

                        <div data-zone="options">
                            ${options.map((option) => `
                                <div value="${option.value}">${option.label}</div>
                            `).join("")}
                        </div>
                    </div>
                </label>
            `;
        }

        return `
            <label class="query-detail-field">
                <span>${field.label}</span>
                <input name="${field.code}" type="text" ${field.readonly ? "readonly" : ""}>
            </label>
        `;
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
        for (const button of this.findAll('[data-zone="footer"] [data-action]'))
        {
            button.addEventListener("click", () => this.executeAction(button.dataset.action));
        }
    }


    async executeAction(action)
    {
        const response = await fetch(this.route, {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                action,
                key: this.key,
                values: this.getValues(),
            }),
        });

        const result = await response.json();

        await this.applyResult(result);
    }


    getValues()
    {
        const values = {};

        for (const field of this.fields)
        {
            const input = this.find(`[name="${field.code}"]`);

            if (input)
            {
                values[field.code] = input.value;
            }
        }

        return values;
    }


    async applyResult(result)
    {
        this.record = result.record ?? this.record;

        if (this.record)
        {
            this.setValues(this.record);
        }
    }


    setValues(record)
    {
        for (const field of this.fields)
        {
            const input = this.find(`[name="${field.code}"]`);

            if (input)
            {
                input.value = record[field.code] ?? "";
            }
        }
    }
}
