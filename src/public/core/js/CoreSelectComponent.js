/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import { Component } from "../../app/js/Component.js";

export class CoreSelectComponent extends Component
{
  static appcoreClass = "app.js.select-component";

  placeholder = "Select...";
  multiple = false;

  _value = null;
  _options = [];

  isOpen = false;


  async onLoad()
  {
    await super.onLoad();
    await Loader.loadStyle("app/styles/select-component.css");

    this.multiple = this.multiple === "true";

    this._value = this.multiple ? [] : null;

    const optionsContainer = this.find(".select-options");

    this._options = [...(optionsContainer?.children ?? [])]
    .map((element) => ({
        value: element.dataset.value ?? element.getAttribute("value") ?? element.textContent.trim(),
        label: element.textContent.trim(),
    }));

    this.find(".select-button")?.addEventListener("click", (event) =>
    {
      event.stopPropagation();
      this.isOpen = !this.isOpen;
      this.node.classList.toggle("is-open", this.isOpen);
    });

    document.addEventListener("click", () =>    
    {
      this.isOpen = false;
      this.node.classList.remove("is-open");
    });

    this.render();
  }


  set value(value)
  {
    this._value = this.multiple
      ? (Array.isArray(value) ? value : [])
      : value;

    this.render();
  }


  get value()
  {
    return this._value;
  }


  set options(options)
  {
    this._options = Array.isArray(options) ? options : [];
    this.render();
  }


  get options()
  {
    return this._options;
  }


  render()
  {
    const label = this.find(".select-label");

    if (label)
    {
      label.textContent = this.getLabel();
    }

    const optionsContainer = this.find(".select-options");

    if (!optionsContainer)
    {
      return;
    }

    optionsContainer.innerHTML = this.options.map((option) =>
    {
      const selected = this.multiple
        ? this.value.includes(option.value)
        : this.value === option.value;

      return `
        <div class="select-option ${selected ? "is-selected" : ""}" data-value="${option.value}">
          ${this.multiple ? `<span class="select-checkbox">${selected ? "✓" : ""}</span>` : ""}
          <span class="select-option-label">${option.label}</span>
        </div>
      `;
    }).join("");

    for (const option of this.findAll(".select-option"))
    {
      option.addEventListener("click", (event) =>
      {
        event.stopPropagation();

        const value = option.dataset.value;

        if (!this.multiple)
        {
          this._value = value;
          this.isOpen = false;
          this.node.classList.remove("is-open");
          this.render();
          this.onChange(this.value);
          return;
        }

        this._value = this.value.includes(value)
          ? this.value.filter((item) => item !== value)
          : [...this.value, value];

        this.render();
        this.node.classList.add("is-open");
        this.isOpen = true;
        this.onChange(this.value);
      });
    }
  }


  getLabel()
  {
    if (this.multiple)
    {
      if (!this.value.length)
      {
        return this.placeholder;
      }

      if (this.value.length === 1)
      {
        return this.options.find((option) => String(option.value) === String(this.value[0]))?.label ?? this.value[0];
      }

      return `${this.value.length} items selected`;
    }

    if (this.value === null || this.value === undefined || this.value === "")
    {
      return this.placeholder;
    }

    return this.options.find((option) => String(option.value) === String(this.value))?.label ?? this.value;
  }


  onChange(value)
  {
    this.node.dispatchEvent(new Event("change", { bubbles: true }));
  }
}