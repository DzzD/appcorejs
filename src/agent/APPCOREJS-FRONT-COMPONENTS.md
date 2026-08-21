# APPCOREJS FRONT COMPONENTS

AppCoreJS provides frontend classes in the `app` layer. They are usable application components, not framework internals. Extend the `app` class when you need application or project behavior; do not extend the corresponding `core` class directly.

The default templates are in `public/core/tpl/`. They can be replaced by a project template with the same identifier, or by an application-wide override under `public/app/tpl/`.

## Component

`Component` is the base class for frontend components. It provides:

- template loading and child-component loading;
- `find()` and `findAll()` helpers scoped to the component node;
- `show()`, `hide()`, `open()` and `close()` visibility hooks;
- `onLoad()`, `onUnload()`, `onResize()` and `onPath()` extension points;
- access to the parent through `parent` and to loaded children through `childs`.

A project component normally extends the app class:

```js
import { Component } from '../../app/js/Component.js';

export class DocumentComponent extends Component
{
    static appcoreClass = 'components.document.document-component';
    static appcoreCss = 'components.document.document-component';

    async onLoad()
    {
        await super.onLoad();
        // component setup
    }
}
```

The component is instantiated from a node such as:

```html
<section
    data-appcore-id="components.document.document-component::main"
    data-template="components.document.document-component">
</section>
```

When a component needs one of its children, resolve it through a getter instead of storing the child instance in a second parent attribute:

```js
get messageListComponent()
{
    return this.getChild('components.message-list-component::messages');
}
```

Use `this.messageListComponent` at the point of use. This keeps the child lookup aligned with the component tree managed by `childs`, including after dynamic child loading or unloading. Avoid duplicating the reference with an assignment such as `this.messageListComponent = this.getChild(...)` unless the value is deliberately a separate, stable application object rather than a component lookup.

## Split Large Components

When a component becomes too large, split it into smaller child components with coherent responsibilities. A child does not need to render a visible UI: it can own a focused behavior, data flow, event handling or coordination task for part of the parent component.

For example, a document screen can contain separate children for its search results, filters and detail actions even when the parent controls the overall layout. Prefer a child component when a subset of behavior has a clear boundary and can be loaded, tested or changed independently. Keep the parent responsible for orchestration and communication between those coherent parts; do not create components merely to move a few unrelated lines into another file.

## Screen

`Screen` is the standard structure for an application page or view. Its default template provides:

```text
screen
└── content
    ├── body
    └── footer
```

Use `data-zone="body"` for the main screen content and `data-zone="footer"` for screen-level actions or additional controls.

A project screen extends `app/js/Screen.js`:

```js
import { Screen } from '../../app/js/Screen.js';

export class DocumentsScreen extends Screen
{
    async onLoad()
    {
        await super.onLoad();
        // load screen-specific data and configure the UI
    }
}
```

The effective inheritance remains:

```text
DocumentsScreen -> app/Screen -> core/CoreScreen -> app/Component -> core/CoreComponent
```

`Screen` is a component structure; it does not select the current URL by itself. Navigation can be coordinated by a `StackComponent` or by the application component.

## StackComponent

`StackComponent` displays a set of child components as a stack and keeps one child active at a time. Its default template contains the `track` zone:

```html
<div data-template="app.tpl.stack-component"
     data-appcore-class="app.js.stack-component">
    <div data-zone="track"></div>
</div>
```

Declare the screens or components inside the track and select one with `active`:

```html
<div data-appcore-id="app.js.stack-component::main-stack"
     data-template="app.tpl.stack-component">
    <section
        data-appcore-id="app.js.screen::home"
        data-template="app.tpl.screen">
    </section>
    <section
        data-appcore-id="app.js.screen::documents"
        data-template="app.tpl.screen">
    </section>
</div>
```

```js
const stack = App.getChild('main-stack');
stack.active = 'documents';
```

The first loaded child becomes active by default. `StackComponent.onPath('/documents/42')` selects the `documents` child and forwards `/42` to it. This is useful when the application maps URL paths to screens.

The stack supports transitions through `transitionMode`, `transitionDuration` and `transitionMinScale`. The default transition combines horizontal sliding, scaling and fading. Set `transitionMode` to `StackComponent.TransitionMode.DEFAULT` when no transition is required.

## MenuComponent

`MenuComponent` renders a menu from its `items` property. Items can contain:

- `label`: displayed text;
- `url`: link destination;
- `action`: callback for an action item;
- `items`: nested submenu items;
- `code`: optional item identifier rendered as `data-code`.

Example:

```js
const menu = App.getChild('main-menu');

menu.items =
[
    { label: 'Home', url: '#/' },
    {
        label: 'Documents',
        items:
        [
            { label: 'List', url: '#/documents' }
        ]
    },
    {
        label: 'Refresh',
        action: () => App.data.refresh()
    }
];
```

The default template provides the `menu` zone. The component renders links, buttons, labels and nested lists there. It also provides a mobile toggle and closes the mobile menu after an entry is clicked.

`MenuComponent` does not implement routing. A `url` is rendered as a link and an `action` is called as a callback. The application remains responsible for defining how those links and actions change its state.

## Window

`Window` is a draggable modal component. Its default template provides:

```text
window
├── title
├── body
└── footer
```

It also contains a modal overlay and default close/confirm buttons. The main methods are:

- `open(args)`: show the window;
- `cancel()`: hide it through the cancel path;
- `validate()`: hide it through the validation path;
- `show(args)` and `hide(args)`: control visibility directly.

Extend the app class to implement application-specific validation or cancellation behavior:

```js
import { Window } from '../../app/js/Window.js';

export class ConfirmWindow extends Window
{
    validate()
    {
        // perform the application action
        super.validate();
    }
}
```

## SelectComponent

`SelectComponent` provides a single or multiple selection control. Its useful properties are:

- `options`: array of `{ value, label }` objects;
- `value`: selected value, or an array when `multiple` is enabled;
- `placeholder`: label shown when there is no selection;
- `multiple`: boolean or dataset value enabling multiple selection.

The component exposes the selected value through `value` and dispatches a bubbling `change` event when the user changes it. The default template provides `button`, `label`, `icon` and `options` zones.

```html
<div data-appcore-id="app.js.select-component::document-type"
     data-template="app.tpl.select-component"
     data-placeholder="Type">
</div>
```

```js
const select = App.getChild('document-type');
select.options =
[
    { value: 'pdf', label: 'PDF' },
    { value: 'txt', label: 'Text' }
];
select.value = 'pdf';
```

## ActionBarComponent

`ActionBarComponent` groups buttons into `left` and `right` zones. Existing buttons are bound automatically when they have an action name in `data-action`, `value` or `name`.

The component can also add an action programmatically:

```js
const actionBar = App.getChild('document-actions');

actionBar.add(
{
    code: 'save',
    label: 'Save'
});
```

The action is delegated to the component hierarchy through `action(name, args)`. A parent component or screen can implement the corresponding action.

## QuerySearchComponent and QueryDetailComponent

These are specialized components for server-defined data screens. They load a definition from `serverUri` and generate their controls from that definition.

- `QuerySearchComponent` manages criteria, search actions, result rendering, ordering and incremental result loading.
- `QueryDetailComponent` manages grouped fields, a record key, loading, editing and detail actions.
- Both can create `SelectComponent` and `ActionBarComponent` children from their definitions.

Use them when the server API follows their expected definition format. For a screen with application-specific behavior, extend the app class or create a project component rather than modifying `public/core`.

## Override Strategy

The default component classes in `public/app/js/` are the application-wide extension layer and can be modified when a behavior must change across the application. Project components should extend those app classes for feature-specific behavior.

Never modify `public/core/js/` or the default templates under `public/core/tpl/`. Synchronization can replace them. To change a default component globally, override its app class or its template in `public/app/`; to change one feature, create a project class and project template.

## Example `application.tpl.html`

The following is a small application shell to place at `<project>/public/application.tpl.html`. It uses a project-specific vocabulary and shows the usual relationship between the application, a menu, a root stack and screens. It is an example to adapt, not a required layout.

```html
<div data-template="application"
     data-appcore-class="app.js.application">

    <div data-appcore-id="app.js.component::startup-loader"
         data-template="app.tpl.appcore-application-loader">
    </div>

    <div data-zone="application" style="display: none;">
        <header data-zone="header">
            <div data-zone="brand">
                <span data-zone="title">Workspace</span>
            </div>

            <nav data-zone="navigation" aria-label="Main navigation">
                <div data-appcore-id="app.js.menu-component::primary-navigation"
                     data-template="app.tpl.menu-component">
                </div>
            </nav>
        </header>

        <main data-zone="main">
            <section data-appcore-id="app.js.stack-component::page-stack"
                     data-uri="*"
                     data-transition-mode="fade+slide-x"
                     data-template="app.tpl.stack-component">

                <div data-zone="track">
                    <section data-appcore-id="app.js.screen::overview"
                             data-template="app.tpl.screen">
                        <div data-zone="body">
                            <h1>Overview</h1>
                            <p>Choose an area from the navigation.</p>
                        </div>
                    </section>

                    <section data-appcore-id="app.js.screen::library"
                             data-template="app.tpl.screen">
                        <div data-zone="body">
                            <div data-appcore-id="components.library.library-screen::library-content"
                                 data-template="components.library.library-screen">
                            </div>
                        </div>
                    </section>

                    <section data-appcore-id="app.js.screen::preferences"
                             data-template="app.tpl.screen">
                        <div data-zone="body">
                            <h1>Preferences</h1>
                            <p>Application settings belong in this screen.</p>
                        </div>
                    </section>
                </div>
            </section>
        </main>

        <footer data-zone="footer">
            <small>Workspace application</small>
        </footer>
    </div>
</div>
```

The root stack uses `data-uri="*"` so that its parent forwards application paths to it. `StackComponent` selects a direct child from the first path segment by component ID; in this example, `#/overview`, `#/library` and `#/preferences` select the children whose IDs end with `::overview`, `::library` and `::preferences`. The remaining path is forwarded to the active screen. The screen does not need its own `data-uri` for this stack behavior.

The menu is intentionally declared without items because its content is application behavior, not template structure. Initialize `primary-navigation.items` from the application class after the child components have been loaded. For example, create or update `<project>/public/app/js/Application.js`:

```js
import { CoreApplication } from '../../core/js/CoreApplication.js';

export class Application extends CoreApplication
{
    async onLoad()
    {
        const primaryNavigation = this.getChild('primary-navigation');

        primaryNavigation.items =
        [
            {
                code: 'overview',
                label: 'Overview',
                url: '#/overview'
            },
            {
                code: 'library',
                label: 'Library',
                url: '#/library'
            },
            {
                code: 'preferences',
                label: 'Preferences',
                url: '#/preferences'
            },
            {
                code: 'reload',
                label: 'Back to overview',
                action: () =>
                {
                    window.location.hash = '#/overview';
                }
            }
        ];

        await super.onLoad();
    }
}

await Application.boot();
```

The menu is already available when the application's `onLoad()` runs because child components are loaded before the parent hook. The `url` entries update the hash and therefore reach `Application.onUrlChange()`; the `action` entry calls application code directly. Replace that action with a project-specific operation when needed.
