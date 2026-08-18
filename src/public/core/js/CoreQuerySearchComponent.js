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
    serverUri = null;
    title = "Recherche";

    criterias = [];
    fields = [];
    actions = [];
    records = null;
    originalRecords = [];

    orderState =
    {
        field: null,
        direction: "asc"
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
        if (!this.records?.length)
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
        return !this.isSearching && this.records.length < this.searchRecordCount;
    }


    renderCriteria(criteria)
    {
        if (criteria.type === "select")
        {
            const options = Array.isArray(criteria.options)
                ? criteria.options
                : [];

            return `
                <label>
                    <span>${criteria.label}</span>

                    <div data-appcore-id="app.js.select-component::criteria-${criteria.code}"
                         data-template="app.tpl.select-component"
                         data-placeholder="${criteria.label}"
                         name="${criteria.code}">

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


    async order(args = {})
    {
        const field = args.field;

        if (!field)
        {
            return;
        }

        this.orderState =
        {
            field,
            direction:
                this.orderState.field === field && this.orderState.direction === "asc"
                    ? "desc"
                    : "asc"
        };

        return this.runSearch("order");
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

        switch (actionName)
        {
            case "search":
            case "order":
            {
                this.resultSize = this.resultSizeMin;
                this.records = null;
                this.originalRecords = [];
                this.find('[data-zone="result"]').scrollTop = 0;
                break;
            }

            case "refresh":
            {
                this.records = null;
                this.originalRecords = [];
                break;
            }

            default:
            {
                break;
            }
        }

        if (actionName === "loadMoreResult")
        {
            this.resultSize += this.resultSizeIncrement;
        }

        this.isSearching = true;

        try
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
                    action: "search",
                    args:
                    {
                        criterias: this.getCriterias(),
                        options:
                        {
                            order: this.orderState,
                            resultSize: this.resultSize
                        }
                    }
                })
            });

            const result = await response.json();

            this.resultSize = result.resultSize ?? this.resultSize;
            this.resultSizeMin = result.resultSizeMin ?? this.resultSizeMin;
            this.resultSizeIncrement = result.resultSizeIncrement ?? this.resultSizeIncrement;
            this.orderState = this.normalizeOrder(result.order ?? this.orderState);
            this.records = Array.isArray(result.records)
                ? result.records
                : [];
            this.originalRecords = this.records.map((record) => this.cloneRecord(record));

            if (result.searchRecordCount !== undefined)
            {
                this.searchRecordCount = result.searchRecordCount;
            }
            else if (result.count !== undefined)
            {
                this.searchRecordCount = result.count;
            }
            else
            {
                this.searchRecordCount = this.records.length;
            }

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


    normalizeOrder(order = null)
    {
        if (!order)
        {
            return {
                field: null,
                direction: "asc"
            };
        }

        return {
            field: order.field ?? order.column ?? null,
            direction: order.direction === "desc" ? "desc" : "asc"
        };
    }


    get visibleFields()
    {
        return this.fields.filter((field) => field.visible !== false);
    }


    async renderResult()
    {
        await Component.setInnerHtml(this.find('[data-zone="result"]'), `
            <div class="query-search-result">
                ${this.renderHeaderRow()}
                ${this.records.map((record, index) => this.renderRow(record, index)).join("")}
            </div>
        `);

        this.bindHeaderFields();
        this.bindRows();
        await this.renderFooter();
    }


    renderHeaderRow()
    {
        return `
            <div class="query-search-result-row query-search-result-header">
                ${this.visibleFields.map((field) => this.renderHeaderField(field)).join("")}
            </div>
        `;
    }


    bindHeaderFields()
    {
        for (const header of this.findAll('[data-zone="result"] [data-field][data-sortable="true"]'))
        {
            this.bindHeaderField(header);
        }
    }


    bindHeaderField(header)
    {
        header.addEventListener("click", async () => await this.action("order",
        {
            field: header.dataset.field
        }));
    }


    bindRows()
    {
        for (const rowNode of this.findAll('[data-zone="result"] .query-search-result-row[data-row-index]'))
        {
            rowNode.addEventListener("click", async () =>
            {
                const rowIndex = Number(rowNode.dataset.rowIndex);

                await this.action("rowClick",
                {
                    rowIndex,
                    current: this.getCurrentRecord(rowIndex),
                    new: this.getNewRecord(rowIndex)
                });
            });
        }
    }


    onRowClick(record)
    {
    }


    getField(code)
    {
        return this.fields.find((field) => field.code === code);
    }


    renderHeaderField(field)
    {
        const isSortable = field.sortable !== false;
        const isOrdered = this.orderState.field === field.code;
        const direction = this.orderState.direction;
        const style = field.width ? ` style="width: ${field.width};"` : "";

        return `
            <div class="query-search-result-cell query-search-result-header-cell"
                 data-field="${field.code}"
                 data-sortable="${isSortable}"${style}>
                ${field.label}
                ${isOrdered ? `<span class="sort-indicator">${direction === "desc" ? "▼" : "▲"}</span>` : ""}
            </div>
        `;
    }


    cloneRecord(record = null)
    {
        if (!record || typeof record !== "object")
        {
            return null;
        }

        return JSON.parse(JSON.stringify(record));
    }


    getCurrentRecord(rowIndex)
    {
        return this.cloneRecord(this.originalRecords[rowIndex] ?? this.records?.[rowIndex] ?? null);
    }


    getNewRecord(rowIndex)
    {
        return this.cloneRecord(this.records?.[rowIndex] ?? null);
    }


    async runServerAction(action, args = null)
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

        return response.json();
    }


    renderRow(record, index)
    {
        return `
            <div class="query-search-result-row" data-row-index="${index}">
                ${this.visibleFields.map((field) => this.renderField(record, field, index)).join("")}
            </div>
        `;
    }


    renderField(record, field)
    {
        return `
            <div class="query-search-result-cell" data-label="${field.label}">
                ${record[field.code] ?? ""}
            </div>
        `;
    }


    async renderFooter()
    {
        const count = this.searchRecordCount;

        await Component.setInnerHtml(this.find('[data-zone="footer"]'), `
            <div class="query-search-footer-count">
                ${count > 1 ? `${count} results` : `${count} result`}
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
        const response = await fetch(this.serverUri);
        const result = await response.json();

        this.title = result.title ?? this.title;
        this.criterias = result.criterias ?? [];
        this.fields = result.fields ?? [];
        this.actions = result.actions ?? [];
        this.orderState = this.normalizeOrder(result.order);
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
                return this.runSearch("search");
            }

            case "order":
            {
                return this.order(args ?? {});
            }

            case "loadMoreResult":
            {
                return this.runSearch("loadMoreResult");
            }

            case "refresh":
            {
                return this.runSearch("refresh");
            }

            case "rowClick":
            {
                return this.onRowClick(args?.new ?? args?.current);
            }

            case "saveRecord":
            {
                const rowIndex = args?.rowIndex;
                const result = await this.runServerAction("save",
                {
                    records:
                    [
                        {
                            current: this.getCurrentRecord(rowIndex),
                            new: this.getNewRecord(rowIndex)
                        }
                    ]
                });

                if (result.records?.[0])
                {
                    this.records[rowIndex] = this.cloneRecord(result.records[0]);
                    this.originalRecords[rowIndex] = this.cloneRecord(result.records[0]);

                    await this.renderResult();
                }

                return result;
            }

            case "deleteRecord":
            {
                return this.runServerAction("delete",
                {
                    records:
                    [
                        {
                            current: this.getCurrentRecord(args?.rowIndex)
                        }
                    ]
                });
            }

            default:
            {
                return super.action(name, args);
            }
        }
    }
}
