## Google Maps

This component can be used with Google’s **Maps Demo Key** for **testing, demonstrations, and prototyping only**.

### Important
- The **Demo Key** must not be used in production.
- `mapId: "DEMO_MAP_ID"` is also intended for testing and demonstration purposes only.
- For a real application, you must configure:
  - a **valid Google Maps API key**
  - a **valid Map ID**
  - appropriate **security restrictions** for the target domain or application

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
    data-appcore-id="ext.map.google.google-map::your-optional-uid"
    data-appcore-class="ext.google.google-map"
    data-apikey="YOUR_GOOGLE_MAPS_API_KEY"
    data-mapid="YOUR_GOOGLE_MAP_ID"
    data-lat="48.8566"
    data-lng="2.3522"
    data-zoom="10">
</div>
```

#### 2. Extended component usage

The component can be extended with a custom JavaScript class.
This works both with inline HTML usage and with programmatic usage.

```js
export class MyMap extends CoreGoogleMap
{
    async onLoad()
    {
        this.apiKey = "YOUR_GOOGLE_MAPS_API_KEY";
        await super.onLoad();
    }
}
```

#### 3. Programmatic usage

The component can also be created and managed directly in JavaScript.
In this mode, the application creates the component instance and may also create or manage the related HTML node.

### Production note

Always replace the demo configuration with your own Google Cloud configuration before deploying to production.

### About this component

- Author: Bruno Augier
- Website: https://appcore.js.com