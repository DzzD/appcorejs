import { Component } from "../../../../app/js/Component.js";

export class CoreGoogleMap extends Component
{
    #apiKey = null;
    #map = null;
    #marker = null;

    constructor(componentId, parent = null)
    {
        super(componentId, parent);
    }

    setApiKey(apiKey)
    {
        this.#apiKey = apiKey;
    }

    async onLoad()
    {
        await Loader.loadStyle("ext/examples/map/google/google-map.css");
        await Loader.loadScript(`https://maps.googleapis.com/maps/api/js?key=${this.#apiKey}`);

        const lat = Number(this.node.dataset.lat ?? 48.8566);
        const lng = Number(this.node.dataset.lng ?? 2.3522);
        const zoom = Number(this.node.dataset.zoom ?? 8);

        this.#map = new google.maps.Map(this.node,
        {
            center: { lat, lng },
            zoom,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true
        });

        this.#marker = new google.maps.Marker(
        {
            position: { lat, lng },
            map: this.#map
        });
    }

    onResize()
    {
        const center = this.#map.getCenter();
        google.maps.event.trigger(this.#map, "resize");
        this.#map.setCenter(center);
    }

    onUnload()
    {
        this.#marker = null;
        this.#map = null;
    }

    setCenter(lat, lng)
    {
        const position =
        {
            lat: Number(lat),
            lng: Number(lng)
        };

        this.#map.setCenter(position);
        this.#marker.setPosition(position);
    }

    setZoom(zoom)
    {
        this.#map.setZoom(Number(zoom));
    }
}