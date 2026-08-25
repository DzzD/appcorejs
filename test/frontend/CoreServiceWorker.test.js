import assert from "node:assert/strict";
import test from "node:test";

const originalGlobals =
{
    self: globalThis.self,
    caches: globalThis.caches,
    fetch: globalThis.fetch
};

let CoreServiceWorker;

function createRequest(url, method = "GET")
{
    return { url, method };
}

function createEvent(request)
{
    return {
        request,
        responsePromise: null,
        respondWith(responsePromise)
        {
            this.responsePromise = responsePromise;
        }
    };
}

function installWorkerEnvironment()
{
    let fetchListener = null;

    globalThis.self =
    {
        location: { origin: "https://example.test" },
        addEventListener(type, listener)
        {
            assert.equal(type, "fetch");
            fetchListener = listener;
        }
    };

    return () => fetchListener;
}

test.before(async () =>
{
    ({ CoreServiceWorker } = await import("../../src/public/core/js/CoreServiceWorker.js"));
});

test.afterEach(() =>
{
    globalThis.self = originalGlobals.self;
    globalThis.caches = originalGlobals.caches;
    globalThis.fetch = originalGlobals.fetch;
});

test("registers only the fetch event", () =>
{
    const getFetchListener = installWorkerEnvironment();

    new CoreServiceWorker();

    assert.equal(typeof getFetchListener(), "function");
});

test("ignores requests without appcore-version", () =>
{
    installWorkerEnvironment();
    const worker = new CoreServiceWorker();
    const event = createEvent(createRequest("https://example.test/file.js"));

    worker.onFetch(event);

    assert.equal(event.responsePromise, null);
});

test("ignores non-GET requests", () =>
{
    installWorkerEnvironment();
    const worker = new CoreServiceWorker();
    const event = createEvent(createRequest("https://example.test/file.js?appcore-version=1", "POST"));

    worker.onFetch(event);

    assert.equal(event.responsePromise, null);
});

test("ignores requests from another origin", () =>
{
    installWorkerEnvironment();
    const worker = new CoreServiceWorker();
    const event = createEvent(createRequest("https://cdn.example.test/file.js?appcore-version=1"));

    worker.onFetch(event);

    assert.equal(event.responsePromise, null);
});

test("returns an exact cached versioned response before using the network", async () =>
{
    installWorkerEnvironment();
    const request = createRequest("https://example.test/file.js?appcore-version=1");
    const cachedResponse = { source: "cache" };
    let matchedRequest = null;
    let fetchCalled = false;

    globalThis.caches =
    {
        async open(cacheName)
        {
            assert.equal(cacheName, "appcore-versioned-files");

            return {
                async match(candidate)
                {
                    matchedRequest = candidate;
                    return cachedResponse;
                }
            };
        }
    };
    globalThis.fetch = async () =>
    {
        fetchCalled = true;
    };

    const worker = new CoreServiceWorker();
    const event = createEvent(request);
    worker.onFetch(event);

    assert.equal(await event.responsePromise, cachedResponse);
    assert.equal(matchedRequest, request);
    assert.equal(fetchCalled, false);
});

test("fetches and caches an exact successful versioned response", async () =>
{
    installWorkerEnvironment();
    const request = createRequest("https://example.test/file.js?appcore-version=2");
    const clonedResponse = { source: "clone" };
    const networkResponse =
    {
        ok: true,
        clone()
        {
            return clonedResponse;
        }
    };
    let storedRequest = null;
    let storedResponse = null;

    globalThis.caches =
    {
        async open()
        {
            return {
                async match()
                {
                    return undefined;
                },
                async put(candidateRequest, candidateResponse)
                {
                    storedRequest = candidateRequest;
                    storedResponse = candidateResponse;
                }
            };
        }
    };
    globalThis.fetch = async (candidate) =>
    {
        assert.equal(candidate, request);
        return networkResponse;
    };

    const worker = new CoreServiceWorker();
    const event = createEvent(request);
    worker.onFetch(event);

    assert.equal(await event.responsePromise, networkResponse);
    assert.equal(storedRequest, request);
    assert.equal(storedResponse, clonedResponse);
});

test("does not cache an unsuccessful network response", async () =>
{
    installWorkerEnvironment();
    const request = createRequest("https://example.test/file.js?appcore-version=3");
    const networkResponse = { ok: false };
    let putCalled = false;

    globalThis.caches =
    {
        async open()
        {
            return {
                async match()
                {
                    return undefined;
                },
                async put()
                {
                    putCalled = true;
                }
            };
        }
    };
    globalThis.fetch = async () => networkResponse;

    const worker = new CoreServiceWorker();
    const event = createEvent(request);
    worker.onFetch(event);

    assert.equal(await event.responsePromise, networkResponse);
    assert.equal(putCalled, false);
});
