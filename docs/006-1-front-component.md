# AppCoreJS Component Design Rules

## 1. General principle

An AppCoreJS component is a bridge between an HTML block and a JavaScript class.

```html
<div data-appcore-id="app.js.my-component::demo">
  <span class="label"></span>
</div>
```

```js
export class MyComponent extends Component
{
  text = "Hello";

  async onLoad()
  {
    await super.onLoad();
    this.render();
  }

  render()
  {
    this.find(".label").textContent = this.text;
  }
}
```

![AppCore<sub>JS</sub> Frontend component](./images/frontend-component-general.png)

## 2. The root node

The block declared with `data-appcore-id` becomes the component root node:

```js
this.node
```

The class never recreates this node.

## 3. The role of `onLoad()`

`onLoad()` initializes the component:

- load styles;
- read optional declarative HTML;
- attach events;
- call `render()`.

## 4. `data-*` attributes

HTML attributes are automatically copied into the instance:

```html
<div data-placeholder="Select..." data-multiple="true"></div>
```

```js
this.placeholder
this.multiple
```

Values remain strings, so convert explicitly when needed:

```js
this.multiple = this.multiple === "true";
```

## 5. The role of the template

A template provides the default internal structure.

It does not replace `this.node`, only its content.

Template attributes act as default values and can be overridden by the HTML instance.

## 6. The role of `render()`

`render()` does not rebuild the whole component.

It fills existing zones:

```js
this.find(".label").textContent = this.text;
```

A missing zone is ignored if it is not required.

## 7. Supported usage modes

A component should be able to work with:

- inline HTML;
- template;
- JavaScript control.
