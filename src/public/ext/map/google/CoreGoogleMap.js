import { Component } from "../../../app/js/Component.js";

export class CoreGoogleMap extends Component
{
    #apiKey = null;
    #map = null;
    #marker = null;
    #mapId = "DEMO_MAP_ID";

    constructor(componentId, parent = null)
    {
        super(componentId, parent);
    }

    async onLoad()
    {
        this.#apiKey = this.node.dataset.apikey ?? this.#apiKey;
        this.#mapId = this.node.dataset.mapid ?? this.#mapId;

        const callbackName = `__appcoreGoogleMapInit_${crypto.randomUUID().replaceAll("-", "")}`;
        
        if (!window.google?.maps?.importLibrary)
        {
            const googleReadyPromise = new Promise((resolve) =>
            {
                window[callbackName] = () =>
                {
                    delete window[callbackName];
                    resolve();
                };
            });

            await Loader.loadScript(
                `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(this.#apiKey)}&v=weekly&loading=async&callback=${callbackName}`
            );

            await googleReadyPromise;
        }

        const lat = Number(this.node.dataset.lat ?? 48.8566);
        const lng = Number(this.node.dataset.lng ?? 2.3522);
        const zoom = Number(this.node.dataset.zoom ?? 8);

        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

        this.#map = new Map(this.node,
        {
            center: { lat, lng },
            zoom,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
            mapId: this.#mapId
        });

        this.#marker = new AdvancedMarkerElement(
        {
            position: { lat, lng },
            map: this.#map
        });
    }

    set apiKey(apiKey)
    {
        this.#apiKey = apiKey;
    }

    set mapId(mapId)
    {
        this.#mapId = mapId;
    }

    onResize()
    {
        if(!this.#map)
        {
            return;
        }
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
        this.#marker.position = position;
    }

    setZoom(zoom)
    {
        this.#map.setZoom(Number(zoom));
    }
}