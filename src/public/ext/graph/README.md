## PanelDraw

This component provides a very minimal drawing area based on a single HTML canvas.

### Usage

```html
<div
    data-appcore-id="ext.graph.panel-draw::demo"
    data-appcore-class="ext.graph.panel-draw"
    data-template="ext/graph/panel-draw/panel-draw.tpl.html">
</div>
```

### Default behavior

By default, the component:
- loads its CSS
- uses a single canvas
- supports pointer drawing
- uses a fixed simple stroke
- does not expose color or brush options

### Notes

- The component is intentionally minimal.
- The drawing surface resizes with the component.
- You can extend `CorePanelDraw` to add tools later.

### About this component

- Author: Bruno Augier
- Website: https://appcore.js.com
