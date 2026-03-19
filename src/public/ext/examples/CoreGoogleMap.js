import { Component } from "../../app/js/Component.js";

export class CoreGoogleMap extends Component
{
    static #apiPromise = null;

    #map = null;
    #marker = null;

    constructor(componentId, parent = null)
    {
        super(componentId, parent);

        Loader.loadStyle("ext/examples/google-map.css");
    }

    async loaded()
    {
        super.loaded();

        await this.#loadGoogleMapsApi();

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

    async #loadGoogleMapsApi()
    {
        if (globalThis.google?.maps)
        {
            return;
        }

        if (CoreGoogleMap.#apiPromise)
        {
            return CoreGoogleMap.#apiPromise;
        }

        CoreGoogleMap.#apiPromise = new Promise((resolve, reject) =>
        {
            const existingScript = document.querySelector('script[data-google-maps-api="1"]');

            if (existingScript)
            {
                existingScript.addEventListener("load", () => resolve(), { once: true });
                existingScript.addEventListener("error", reject, { once: true });

                if (globalThis.google?.maps)
                {
                    resolve();
                }

                return;
            }

            const script = document.createElement("script");
            script.src = "https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY";
            script.async = true;
            script.defer = true;
            script.setAttribute("data-google-maps-api", "1");

            script.onload = () => resolve();
            script.onerror = reject;

            document.head.appendChild(script);
        });

        return CoreGoogleMap.#apiPromise;
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