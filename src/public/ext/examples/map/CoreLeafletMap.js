import { Component } from "../../../app/js/Component.js";

export class CoreLeafletMap extends Component
{
    static #apiPromise = null;

    #map = null;
    #marker = null;

    constructor(componentId, parent = null)
    {
        super(componentId, parent);

        Loader.loadStyle("ext/examples/map/leaflet-map.css");
    }

    async loaded()
    {
        super.loaded();

        await this.#loadLeaflet();

        const lat = Number(this.node.dataset.lat ?? 48.8566);
        const lng = Number(this.node.dataset.lng ?? 2.3522);
        const zoom = Number(this.node.dataset.zoom ?? 8);

        this.#map = L.map(this.node).setView([lat, lng], zoom);

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(this.#map);

        this.#marker = L.marker([lat, lng]).addTo(this.#map);
    }

    async #loadLeaflet()
    {
        if (globalThis.L)
        {
            return;
        }

        if (CoreLeafletMap.#apiPromise)
        {
            return CoreLeafletMap.#apiPromise;
        }

        CoreLeafletMap.#apiPromise = new Promise((resolve, reject) =>
        {
            const existingScript = document.querySelector('script[data-leaflet-api="1"]');

            if (existingScript)
            {
                existingScript.addEventListener("load", () => resolve(), { once: true });
                existingScript.addEventListener("error", reject, { once: true });

                if (globalThis.L)
                {
                    resolve();
                }

                return;
            }

            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);

            const script = document.createElement("script");
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.async = true;
            script.defer = true;
            script.setAttribute("data-leaflet-api", "1");

            script.onload = () => resolve();
            script.onerror = reject;

            document.head.appendChild(script);
        });

        return CoreLeafletMap.#apiPromise;
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