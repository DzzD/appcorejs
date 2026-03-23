# ext/examples

This directory contains **example components** and **experimental integrations** for the framework.

It is intended for:
- component examples
- prototypes
- beta components
- alpha components
- work-in-progress integrations

## Purpose

The `ext/examples` package is a sandbox area for testing ideas, validating integrations, and sharing reusable component experiments without promoting them as stable framework features.

Components stored here may be useful in real projects, but they should be considered **non-final** unless explicitly stated otherwise.

## Typical use cases

Use `ext/examples` for:
- demonstration components
- proof-of-concept integrations
- early UI experiments
- temporary or evolving external components
- candidate components that may later move to a more stable package

## Stability

Content in this directory may be:
- incomplete
- experimental
- subject to breaking changes
- refactored, moved, or removed without notice

Do not treat `ext/examples` as a stable public API.

## Naming and organization

Each example component should remain self-contained whenever possible.

Typical file structure:

```text
ext/examples/<domain>/<component-name>/
    <ComponentClassname>.js
    <CoreComponentClassname>.js
    <component-name>.tpl.html
    <component-name>.css
    <core-component-name>.css
    README.md
```

Example for a pie-chart component:

```text
ext/examples/stats/pie-chart/
    PieChart.js
    CorePieChart.js
    pie-chart.tpl.html
    pie-chart.css
    core-pie-chart.css
    README.md
```

## Usage

Example components can be used like any other component, including:
- inline HTML usage
- extended class usage
- programmatic usage

## Recommendation

If a component becomes mature, reusable, and stable enough for production use, it should be moved out of `ext/examples` into a dedicated stable package.

## About this directory

This directory is intended to encourage experimentation while keeping the core framework clean, stable, and production-oriented.