# 007 - Examples

This chapter shows a full component example.

## Example: VisioComponent

### Frontend files

```text
./<project>/public/components/visio/
  VisioComponent.js
  visio-component.css
  visio-component.tpl.html
```

### Backend files

```text
./<project>/server/components/VisioComponent.js
```

## Minimal frontend class

```js
import { Component } from '../../../app/js/Component.js';

export class VisioComponent extends Component
{
    static appcoreClass = 'components.visio.visio-component';
}
```

## Minimal HTML usage

```html
<div data-appcore-id="components.visio.visio-component::main"></div>
```

## Minimal server component skeleton

```js
import { ServerComponent } from '../../../app/server/ServerComponent.js';

export class VisioComponent extends ServerComponent
{
    async start()
    {
    }

    async stop()
    {
    }
}
```

## Why this split matters

- frontend files stay in `public/components/visio/`
- backend runtime integration stays in `server/components/`
- framework API is always consumed through `app`

## Next step

Return to [docs index](./README.md).
