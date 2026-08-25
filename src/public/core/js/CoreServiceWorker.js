/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

export class CoreServiceWorker
{
    constructor()
    {
        self.addEventListener("fetch", (event) =>
        {
            this.onFetch(event);
        });
    }

    onFetch(event)
    {
        const request = event.request;
        const url = new URL(request.url);

        if (request.method !== "GET" || url.origin !== self.location.origin || !url.searchParams.has("appcore-version"))
        {
            return;
        }

        event.respondWith((async () =>
        {
            const cache = await caches.open("appcore-versioned-files");
            const cachedResponse = await cache.match(request);

            if (cachedResponse)
            {
                return cachedResponse;
            }

            const response = await fetch(request);

            if (response.ok)
            {
                await cache.put(request, response.clone());
            }

            return response;
        })());
    }
}
