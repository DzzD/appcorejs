# APPCOREJS FRONT

The project frontend root is `<project>/public`.

```text
public/
├── core/                 synchronized framework resources; do not edit
├── app/                  preserved application-wide frontend overrides
├── components/           project components
├── js/io/Data.js         project data and IO facade
├── css/                  project styles
├── tpl/                  project templates
└── assets/               project assets
```

## Resource Resolution

For an unprefixed request such as `assets/logo.svg`, `components/hello/HelloComponent.js`, or `application.tpl.html`, the server tries:

```text
public/<path>
public/app/<path>
public/core/<path>
```

Prefixes intentionally restrict resolution:

```text
app/<path>  -> public/app/<path>, then public/core/<path>
core/<path> -> public/core/<path> only
```

This rule applies to JavaScript, CSS, templates, assets, and other static files. Project files normally use unprefixed paths. Built-in AppCoreJS identifiers commonly start with `app`, so they resolve through `public/app` and then `public/core`.

For a request without `.tpl.`, the server first tries the corresponding template filename across all allowed layers, then the ordinary filename. `/index.html` therefore resolves as:

```text
public/index.tpl.html
public/app/index.tpl.html
public/core/index.tpl.html
public/index.html
public/app/index.html
public/core/index.html
```

The `.tpl.` preference is extension-agnostic. Server-side `processTemplate()` currently returns content unchanged; do not rely on placeholder substitution.

## Frontend Entry Templates

After generation, the first frontend task is normally to create these project-owned files:

```text
<project>/public/index.tpl.html
<project>/public/application.tpl.html
```

Default versions exist under `public/core`, but they are fallbacks and must not be modified.

`index.tpl.html` is the HTML document entry point. It defines the page metadata, loads `app/css/styles.css` and `app/js/Application.js`, and declares the root Application component:

```html
<body
    data-appcore-id="app.js.application"
    data-template="application">
</body>
```

`application.tpl.html` is mandatory application structure. It is loaded into that root component and defines the persistent application shell and its screens or project components. It must provide the application zone used by `Application` when startup completes:

```html
<div data-template="application">
    <div data-zone="application" style="display: none;">
        <!-- application UI -->
    </div>
</div>
```

The core fallback for `application.tpl.html` only reports that the project template is missing. A real application should therefore replace both core fallbacks at project level, especially the mandatory `application.tpl.html`.

## Frontend Inheritance

The default frontend components are described separately in `APPCOREJS-FRONT-COMPONENTS.md`.
Read it for the application-facing usage of `Screen`, `StackComponent`, `MenuComponent`, `Window`, `SelectComponent`, `ActionBarComponent` and the query components.

Project components extend the app class, never the core class directly:

```js
import { Component } from '../../app/js/Component.js';

export class HelloComponent extends Component
{
    static appcoreClass = 'components.hello.hello-component';
    static appcoreCss = 'components.hello.hello-component';
}
```

For a built-in screen, the effective chain is:

```text
project screen -> app Screen -> core CoreScreen -> app Component -> core CoreComponent
```

Override a file under `public/app` only to change application-wide behavior. Add a project class above the app class for feature-specific behavior.

## Component Identification and Loading

An element declares its component class with `data-appcore-id`:

```html
<section
    data-appcore-id="components.hello.hello-component::main"
    data-template="components.hello.hello-component">
</section>
```

This loads `components/hello/HelloComponent.js`, export `HelloComponent`. The suffix after `::` identifies the instance.

`data-template` is converted to `<identifier>.tpl.html`. Here it loads `components/hello/hello-component.tpl.html` before `onLoad()`.

The template's first root element supplies missing attributes. Its children are inserted into the existing component node. Existing direct `data-zone` contents are preserved and merged by zone name.

When a component accesses one of its child components, resolve the child through a getter instead of copying the component reference into a second parent property:

```js
get messageListComponent()
{
    return this.getChild('js.message-list-component::messages');
}
```

Use `this.messageListComponent` when the child is needed. This keeps the access aligned with the component tree managed by `childs`, including when children are loaded or unloaded dynamically. Prefer this pattern to:

```js
this.messageListComponent = this.getChild('js.message-list-component::messages');
```

unless the value is intentionally a separate, stable application object rather than a component lookup.

When a component becomes too large, split it into child components with coherent responsibilities. A child component does not need to render a visible area: it may group a focused behavior, data flow, event handling or coordination task for the parent. Keep the parent responsible for overall orchestration and communication between those parts. Do not introduce a child component only to move a few unrelated lines into another file.

## Classes and CSS

`data-appcore-class` is a space-separated styling marker; it does not choose the JavaScript class. During loading, AppCoreJS adds every static `appcoreClass` declared along the inheritance chain, parent first, and preserves explicit values already on the element.

For example, a project component can receive both:

```text
app.js.component components.hello.hello-component
```

AppCoreJS also loads every static `appcoreCss` declared by the inheritance chain, parent first. A component derived from `Component` therefore loads the parent component CSS before its own static CSS. Loader caching prevents duplicate stylesheet loads.

An element may add instance-specific styles:

```html
<section
    data-appcore-id="components.hello.hello-component::main"
    data-appcore-css="css.compact, css.high-contrast">
</section>
```

`data-appcore-css` becomes the instance property `appcoreCss`; comma-separated identifiers load `css/compact.css` and `css/high-contrast.css` after inherited static CSS.

App-layer styles normally import their core implementation, then add overrides:

```css
@import url("../../core/css/core-component.css");

/* application-wide overrides */
```

## Useful Component Lifecycle

`load()` performs, in order:

1. load and merge the template;
2. attach the component to its DOM node;
3. apply the full `data-appcore-class` chain;
4. load inherited static CSS;
5. copy all `data-*` dataset values onto the component instance;
6. load optional `data-appcore-css` styles;
7. load direct child components;
8. create the resize observer;
9. await `onLoad()`.

Override `async onLoad()` for setup and call `await super.onLoad()` when parent setup must run. Child components are already loaded when the parent hook runs. Use `onUnload()` for cleanup and `onResize()` for size-dependent behavior.

## `Data`

`public/js/io/Data.js` is created once and is project-owned. AppCoreJS imports it during boot, creates one instance, and exposes it as `App.data`.

Use `Data` as the application access point for HTTP calls, IO, and shared data operations. Keep rendering and DOM manipulation in UI components.

```js
export class Data
{
    async getHello()
    {
        const response = await fetch('/api/hello');

        if (!response.ok)
        {
            throw new Error(`Hello request failed: ${response.status}`);
        }

        return await response.json();
    }
}
```

A component then uses `await App.data.getHello()` and renders the result.

## Synchronization

- `public/core` is replaced: never modify it.
- `public/app` and project resources are preserved.
- `public/js/io/Data.js` is created only when missing.
- `public/ext` and `public/intro` are included only when their CLI options are selected.
