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
    serverUri = null;
    title = "Détail";
    #key = null;

    keyFields =
    [
        "id"
    ];

    groups = [];
    fields = [];
    actions = [];
    record = null;


    async onLoad()
    {
        await super.onLoad();

        await this.loadDefinition();
        await this.render();

        if (this.key)
        {
            await this.action("search");
        }
    }


    get key()
    {
        return this.#key;
    }


    set key(value)
    {
        this.#key = value;

        if (!this.isLoaded)
        {
            return;
        }

        if (this.#key)
        {
            this.action("search");
            return;
        }

        this.clear();
    }


    clear()
    {
        this.record = null;
        this.setValues({});
    }


    async loadDefinition()
    {
        const response = await fetch(this.serverUri);
        const result = await response.json();

        this.title = result.title ?? this.title;
        this.keyFields = Array.isArray(result.key)
            ? result.key
            : [result.key ?? this.keyFields[0]];
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

        await Component.setInnerHtml(this.find('[data-zone="footer"]'), "");
        await this.renderActions();
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
        return this.fields.filter((field) => field.group === group.code && field.visible !== false);
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


    async renderActions()
    {
        const actionsZone = this.find('[data-zone="actions"]');

        if (!actionsZone)
        {
            return;
        }

        if (!Array.isArray(this.actions) || this.actions.length === 0)
        {
            return;
        }

        let actionBar = this.getChild(this.find('[data-zone="actions"] [data-appcore-class~="app.js.action-bar-component"]')?.getAttribute("data-appcore-id"));

        if (!actionBar)
        {
            await Component.setInnerHtml(actionsZone, `
                <div data-appcore-id="app.js.action-bar-component::query-detail-actions-bar"
                     data-template="app.tpl.action-bar-component">
                </div>
            `);

            actionBar = this.getChild("query-detail-actions-bar");
        }

        const actionCodes = new Set();

        for (const button of actionBar.findAll("button, input[type=\"button\"], input[type=\"submit\"]"))
        {
            const actionCode = actionBar.getActionName(button);

            if (!actionCode)
            {
                continue;
            }

            actionCodes.add(actionCode);
        }

        for (const action of this.actions)
        {
            if (actionCodes.has(action.code))
            {
                continue;
            }

            actionBar.add(action);
        }
    }


    async action(name, args = null)
    {
        switch (name)
        {
            case "search":
            {
                return this.executeAction("search", args ??
                {
                    criterias: this.getSearchCriterias(),
                    options:
                    {
                        limit: 1
                    }
                });
            }

            case "save":
            {
                return this.executeAction("save", args ??
                {
                    records:
                    [
                        {
                            current: this.cloneRecord(this.record),
                            new: this.getValues()
                        }
                    ]
                });
            }

            case "delete":
            {
                return this.executeAction("delete", args ??
                {
                    records:
                    [
                        {
                            current: this.cloneRecord(this.record) ?? this.getKeyRecord()
                        }
                    ]
                });
            }

            default:
            {
                const actionCodes = this.actions.map((action) => action.code);

                if (actionCodes.includes(name))
                {
                    return this.executeAction(name, args ?? {});
                }

                return super.action(name, args);
            }
        }
    }


    async executeAction(action, args = null)
    {
        const response = await fetch(this.serverUri,
        {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
            {
                action,
                args: args ?? {}
            })
        });

        const result = await response.json();

        await this.applyResult(result);

        return result;
    }


    getSearchCriterias()
    {
        return this.getKeyRecord();
    }


    getKeyRecord()
    {
        if (!Array.isArray(this.keyFields) || this.keyFields.length === 0)
        {
            return {};
        }

        const keyRecord = {};

        if (typeof this.key === "object" && this.key !== null)
        {
            for (const keyField of this.keyFields)
            {
                keyRecord[keyField] = this.key[keyField];
            }

            return keyRecord;
        }

        keyRecord[this.keyFields[0]] = this.key;

        return keyRecord;
    }


    getValues()
    {
        const values =
        {
            ...(this.record ?? {})
        };

        for (const field of this.fields)
        {
            const input = this.find(`[name="${field.code}"]`);

            if (!input)
            {
                continue;
            }

            values[field.code] = input.value;
        }

        return values;
    }


    async applyResult(result)
    {
        if (result.action === "delete")
        {
            if (!result.error)
            {
                this.record = null;
                this.setValues({});
            }

            return;
        }

        const record = result.records?.[0] ?? result.record ?? null;

        if (record)
        {
            this.record = this.cloneRecord(record);
            this.setValues(this.record);
            return;
        }

        this.setValues(this.record ?? {});
    }


    cloneRecord(record = null)
    {
        if (!record || typeof record !== "object")
        {
            return null;
        }

        return JSON.parse(JSON.stringify(record));
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
