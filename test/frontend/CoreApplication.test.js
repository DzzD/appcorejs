import assert from "node:assert/strict";
import test from "node:test";

const originalNavigator = globalThis.navigator;
const originalDocument = globalThis.document;
const originalWindow = globalThis.window;
let CoreApplication;
let Loader;
let Log;

test.before(async () =>
{
    globalThis.document =
    {
        querySelector()
        {
            return null;
        }
    };

    ({ CoreApplication } = await import("../../src/public/core/js/CoreApplication.js"));
    ({ Loader } = await import("../../src/public/app/js/Loader.js"));
    ({ Log } = await import("../../src/public/app/js/Log.js"));
});

test.afterEach(() =>
{
    Object.defineProperty(globalThis, "navigator", { configurable: true, value: originalNavigator });
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
    delete globalThis.app;
});

test("returns null when Service Workers are unavailable", async () =>
{
    Object.defineProperty(globalThis, "navigator", { configurable: true, value: {} });

    const registration = await CoreApplication.prototype.registerServiceWorker.call({});

    assert.equal(registration, null);
});

test("registers the module Service Worker relative to document.baseURI", async () =>
{
    const expectedRegistration = { scope: "https://example.test/webchat/" };
    let registeredUrl = null;
    let registeredOptions = null;

    globalThis.document = { baseURI: "https://example.test/webchat/index.html" };
    Object.defineProperty(globalThis, "navigator",
    {
        configurable: true,
        value:
        {
            serviceWorker:
            {
                async register(url, options)
                {
                    registeredUrl = url;
                    registeredOptions = options;
                    return expectedRegistration;
                }
            }
        }
    });

    const registration = await CoreApplication.prototype.registerServiceWorker.call({});

    assert.equal(registration, expectedRegistration);
    assert.equal(registeredUrl.href, "https://example.test/webchat/service-worker.js");
    assert.deepEqual(registeredOptions, { type: "module" });
});

test("registers at the root when document.baseURI is at the root", async () =>
{
    let registeredUrl = null;

    globalThis.document = { baseURI: "https://example.test/index.html" };
    Object.defineProperty(globalThis, "navigator",
    {
        configurable: true,
        value:
        {
            serviceWorker:
            {
                async register(url)
                {
                    registeredUrl = url;
                    return {};
                }
            }
        }
    });

    await CoreApplication.prototype.registerServiceWorker.call({});

    assert.equal(registeredUrl.href, "https://example.test/service-worker.js");
});

test("automatically registers after loading the application", async () =>
{
    const originalLoadClass = Loader.loadClass;
    const events = [];

    globalThis.window = globalThis;
    Loader.loadClass = async () => class Data {};

    class TestApplication extends CoreApplication
    {
        async load()
        {
            events.push("load");
        }

        async registerServiceWorker()
        {
            events.push("register");
            return { scope: "/" };
        }
    }

    try
    {
        await TestApplication.boot();

        assert.deepEqual(events, ["load", "register"]);
        assert.deepEqual(globalThis.app.serviceWorkerRegistration, { scope: "/" });
    }
    finally
    {
        Loader.loadClass = originalLoadClass;
    }
});

test("does not block boot when Service Worker registration fails", async () =>
{
    const originalLoadClass = Loader.loadClass;
    const originalLogError = Log.error;
    let loggedError = null;

    globalThis.window = globalThis;
    Loader.loadClass = async () => class Data {};
    Log.error = (...args) =>
    {
        loggedError = args;
    };

    class TestApplication extends CoreApplication
    {
        async load()
        {
        }

        async registerServiceWorker()
        {
            throw new Error("registration failed");
        }
    }

    try
    {
        await TestApplication.boot();

        assert.equal(globalThis.app.serviceWorkerRegistration, null);
        assert.equal(loggedError[0], "[CoreApplication] Service Worker registration failed");
        assert.equal(loggedError[1].message, "registration failed");
    }
    finally
    {
        Loader.loadClass = originalLoadClass;
        Log.error = originalLogError;
    }
});
