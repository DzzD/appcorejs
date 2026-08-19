/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { Component } from "../../app/js/Component.js";

export class CoreMenuComponent extends Component
{
    static appcoreClass = "app.js.menu-component";
    static appcoreCss = "app.css.menu-component";

    #items = [];

    async onLoad()
    {
        await super.onLoad();

        this.render();
    }

    set items(value)
    {
        this.#items = Array.isArray(value) ? value : [];

        if (this.isLoaded)
        {
            this.render();
        }
    }

    get items()
    {
        return this.#items;
    }

    render()
    {
        const menuZone = this.find('[data-zone="menu"]');

        const actionItems = new Map();
        const html = this.#renderMenu(actionItems);

        menuZone.innerHTML = html;

        this.#bindMobileToggle(menuZone);
        this.#bindActions(menuZone, actionItems);
        this.#bindCloseOnClick(menuZone);
        this.#syncMobileToggle(menuZone);
    }

    #renderMenu(actionItems)
    {
        const expanded = this.node.classList.contains("menu-mobile-open") ? "true" : "false";
        const itemsHtml = this.#renderItems(this.#items, 0, "", actionItems);

        return `
            <button type="button" class="menu-mobile-toggle" data-menu-mobile-toggle aria-expanded="${expanded}" aria-label="Ouvrir le menu">
                <img class="menu-mobile-toggle-icon menu-mobile-toggle-icon--menu" src="assets/icons/feather/menu.svg" alt="" aria-hidden="true" />
                <img class="menu-mobile-toggle-icon menu-mobile-toggle-icon--close" src="assets/icons/feather/x.svg" alt="" aria-hidden="true" />
            </button>
            ${itemsHtml}
        `;
    }

    #renderItems(items, level, pathPrefix, actionItems)
    {
        const listClass = level === 0 ? "menu-items" : "menu-subitems";

        if (!Array.isArray(items) || items.length === 0)
        {
            return `<ul class="${listClass}"></ul>`;
        }

        const content = items.map((rawItem, index) =>
        {
            const item = rawItem && typeof rawItem === "object" ? rawItem : {};
            const currentPath = pathPrefix ? `${pathPrefix}.${index}` : String(index);
            const childItems = Array.isArray(item.items) ? item.items : [];
            const hasChildren = childItems.length > 0;
            const label = this.#escapeHtml(item.label ?? item.code ?? "");
            const codeAttribute = item.code
                ? ` data-code="${this.#escapeAttribute(item.code)}"`
                : "";

            let entry = "";

            if (typeof item.url === "string" && item.url.length > 0)
            {
                entry = `<a href="${this.#escapeAttribute(item.url)}" class="menu-link">${label}</a>`;
            }
            else if (typeof item.action === "function")
            {
                actionItems.set(currentPath, item);
                entry = `<button type="button" class="menu-button" data-menu-action-path="${this.#escapeAttribute(currentPath)}">${label}</button>`;
            }
            else
            {
                entry = `<span class="menu-label">${label}</span>`;
            }

            const children = hasChildren
                ? this.#renderItems(childItems, level + 1, currentPath, actionItems)
                : "";

            return `<li class="menu-item"${codeAttribute}>${entry}${children}</li>`;
        }).join("");

        return `<ul class="${listClass}">${content}</ul>`;
    }

    #bindActions(menuZone, actionItems)
    {
        const actionButtons = [...menuZone.querySelectorAll("[data-menu-action-path]")];

        for (const actionButton of actionButtons)
        {
            const actionPath = actionButton.getAttribute("data-menu-action-path");
            const item = actionItems.get(actionPath);

            if (!item || typeof item.action !== "function")
            {
                continue;
            }

            actionButton.addEventListener("click", (event) =>
            {
                item.action(event, item, this);
            });
        }
    }

    #bindMobileToggle(menuZone)
    {
        const mobileToggle = menuZone.querySelector("[data-menu-mobile-toggle]");

        if (!mobileToggle)
        {
            return;
        }

        mobileToggle.addEventListener("click", (event) =>
        {
            event.stopPropagation();
            this.node.classList.toggle("menu-mobile-open");
            this.#syncMobileToggle(menuZone);
        });
    }

    #bindCloseOnClick(menuZone)
    {
        const clickableEntries = [...menuZone.querySelectorAll(".menu-link, .menu-button, .menu-label")];

        for (const clickableEntry of clickableEntries)
        {
            clickableEntry.addEventListener("click", (event) =>
            {
                this.node.classList.remove("menu-mobile-open");
                this.#syncMobileToggle(menuZone);

                const clickedEntry = event.currentTarget;
                clickedEntry?.blur?.();
            });
        }
    }

    #syncMobileToggle(menuZone)
    {
        const mobileToggle = menuZone.querySelector("[data-menu-mobile-toggle]");

        if (!mobileToggle)
        {
            return;
        }

        const isOpen = this.node.classList.contains("menu-mobile-open");
        const expanded = isOpen ? "true" : "false";
        const label = isOpen ? "Fermer le menu" : "Ouvrir le menu";

        mobileToggle.setAttribute("aria-expanded", expanded);
        mobileToggle.setAttribute("aria-label", label);
    }

    #escapeHtml(value)
    {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    #escapeAttribute(value)
    {
        return this.#escapeHtml(value);
    }
}
