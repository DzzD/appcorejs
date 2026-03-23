## Leaflet

This component uses **Leaflet** with **OpenStreetMap** tiles by default.

### Important
- The default tile layer is loaded from **OpenStreetMap**.
- If your application has specific usage, branding, hosting, or availability requirements, you may want to configure your own tile provider.

### Usage modes

This component can be used in different ways depending on how the application is structured.

#### 1. Inline HTML usage

The component can be declared directly in HTML by using the appropriate attributes.
In this mode, the map is instantiated from the HTML declaration.

The `data-appcore-id` attribute uniquely identifies the component instance.
Its value usually consists of a fully qualified component name, optionally followed by a custom instance UID:

`package.class-name::your-optional-uid`

```html
<div
    data-appcore-id="ext.map.leaflet.leaflet-map::your-optional-uid"
    data-appcore-class="ext.map.leaflet.leaflet-map"
    data-lat="48.8566"
    data-lng="2.3522"
    data-zoom="10">
</div>
```

#### 2. Extended component usage

The component can be extended with a custom JavaScript class.
This works both with inline HTML usage and with programmatic usage.

```js
export class MyLeafletMap extends CoreLeafletMap
{
    async onLoad()
    {
        await super.onLoad();
    }
}
```

#### 3. Programmatic usage

The component can also be created and managed directly in JavaScript.
In this mode, the application creates the component instance and may also create or manage the related HTML node.

### Default behavior

By default, the component:
- loads Leaflet styles and script from the official CDN
- creates the map from the component node
- centers the map using `data-lat`, `data-lng`, and `data-zoom`
- adds an OpenStreetMap tile layer
- adds a marker at the current center

### Template support

A component template is optional.
If the component node defines a `data-template` attribute, the specified template file is loaded and used as the component markup.
Otherwise, the component must create or manage its own HTML structure.

### Production note

Before deploying to production, make sure the selected tile source, usage limits, attribution requirements, and availability are suitable for your application.

### About this component

- Author: Bruno Augier
- Website: https://appcore.js.com