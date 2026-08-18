/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { Component } from "../../app/js/Component.js";

export class CoreActionBarComponent extends Component
{
    async onLoad()
    {
        await super.onLoad();

        this.collectInlineButtons();
        this.bindButtons();
    }

    collectInlineButtons()
    {
        const rightZone = this.find('[data-zone="right"]');

        if (!rightZone)
        {
            return;
        }

        for (const button of this.findAll("button, input[type=\"button\"], input[type=\"submit\"]"))
        {
            if (button.closest("[data-zone]"))
            {
                continue;
            }

            rightZone.appendChild(button);
        }
    }

    bindButtons()
    {
        for (const button of this.findAll("button, input[type=\"button\"], input[type=\"submit\"]"))
        {
            this.bindButton(button);
        }
    }

    bindButton(button, args = null)
    {
        if (!button)
        {
            return;
        }

        if (!this.getActionName(button))
        {
            return;
        }

        if (button.dataset.actionBarBound === "true")
        {
            return;
        }

        button.dataset.actionBarBound = "true";
        button.addEventListener("click", async (event) =>
        {
            const actionName = this.getActionName(event.currentTarget);

            if (!actionName)
            {
                return;
            }

            await this.action(actionName, args);
        });
    }

    getActionName(button)
    {
        const dataAction = button.getAttribute("data-action");

        if (dataAction)
        {
            return dataAction;
        }

        const value = button.getAttribute("value");

        if (value)
        {
            return value;
        }

        const name = button.getAttribute("name");

        if (name)
        {
            return name;
        }

        return null;
    }

    add(action, align = "right")
    {
        if (!action)
        {
            return null;
        }

        const zoneName = align === "left"
            ? "left"
            : "right";

        const zone = this.find(`[data-zone="${zoneName}"]`);

        if (!zone)
        {
            return null;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("data-action", action.code ?? "");
        button.textContent = action.label ?? action.code ?? "";

        zone.appendChild(button);
        this.bindButton(button, action);

        return button;
    }
}
