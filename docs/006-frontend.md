# 006 - Frontend

AppCoreJS frontend combines two things:

1. classic HTML
2. component inclusion through `data-appcore-id`

## Minimal page idea

You can keep regular HTML markup.
You inject dynamic behavior only where needed.

```html
<header>
    <h1>My page</h1>
</header>

<div data-appcore-id="components.user-search.user-search-component::users"></div>
```

## Component declaration

`data-appcore-id` identifies the component class to load.

Format:

```text
<path.to.component>::optional-uid
```

Examples:

- `app.js.application`
- `app.js.window::window-info`
- `components.user-search.user-search-component::users`

## With template

Use `data-template` when markup is externalized.

```html
<div
    data-appcore-id="components.user-search.user-search-component::users"
    data-template="app.tpl.search-component">
</div>
```

## Frontend folders

```text
./<project>/public/
  core/
  app/
  assets/
  ext/
  components/
  screens/
```

- `core/`: frontend engine internals.
- `app/`: mandatory frontend interface layer.
- `assets/`: static resources only.
- `ext/`: external modules/components.
- `components/`: reusable project components.
- `screens/`: page/screen-level project components.

## Components vs screens

- `components/` are reusable UI bricks.
- `screens/` compose page flows and states.

## Global frontend behavior via `app/js/Component.js`

All frontend components inherit from `Component` (through `CoreComponent`).

So `app/js/Component.js` is the global control point.

### Example: global onLoad rule for every component

```js
import { CoreComponent } from '../../core/js/CoreComponent.js';

export class Component extends CoreComponent
{
    async onLoad()
    {
        await super.onLoad();
        this.node.dataset.loaded = '1';
    }
}
```

If project components call `super.onLoad()`, this rule applies everywhere.

## Loader usage

Typical style loading:

```js
await Loader.loadStyle('app/styles/search-component.css');
```

Use layer-first paths only.

Do not use legacy flat paths like `public/js` or `public/styles`.

## Important template rule

Do not store templates in `assets`.

Templates should be in:

- component/screen folders
- or dedicated interface template folders (example: `app/tpl`)

## Cross-reference

- Architecture: [002 - Architecture](./002-architecture.md)
- Server/static relation: [005 - Server](./005-server.md)
- Complete sample: [007 - Examples](./007-examples.md)
