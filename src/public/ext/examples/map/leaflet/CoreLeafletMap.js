import { Component } from "../../../../app/js/Component.js";

export class CoreLeafletMap extends Component
{
    #map = null;
    #marker = null;

    constructor(componentId, parent = null)
    {
        super(componentId, parent);
    }

    async onLoad()
    {
        await Loader.loadStyle("ext/examples/map/leaflet/leaflet-map.css");
        await Loader.loadStyle("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
        await Loader.loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");

        const lat = Number(this.node.dataset.lat ?? 48.8566);
        const lng = Number(this.node.dataset.lng ?? 2.3522);
        const zoom = Number(this.node.dataset.zoom ?? 8);

        this.#map = L.map(this.node).setView([lat, lng], zoom);

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap"
        }).addTo(this.#map);

        this.#marker = L.marker([lat, lng]).addTo(this.#map);
    }

    onResize()
    {
        this.#map?.invalidateSize();
    }

    onUnload()
    {
        this.#map.remove();
        this.#map = null;
        this.#marker = null;
    }

    setCenter(lat, lng)
    {
        const position = [Number(lat), Number(lng)];

        this.#map.setView(position, this.#map.getZoom());
        this.#marker.setLatLng(position);
    }

    setZoom(zoom)
    {
        this.#map.setZoom(Number(zoom));
    }
}