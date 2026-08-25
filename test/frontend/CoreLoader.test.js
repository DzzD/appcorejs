import assert from "node:assert/strict";
import test from "node:test";

const originalDocument = globalThis.document;
let CoreLoader;

test.before(async () =>
{
    globalThis.document = { baseURI: "https://example.test/application/" };
    ({ CoreLoader } = await import("../../src/public/core/js/CoreLoader.js"));
});

test.after(() =>
{
    globalThis.document = originalDocument;
});

test("adds appcore-version to AppCore resource URLs", () =>
{
    CoreLoader.setVersion("123");

    const url = CoreLoader._withVersion("components/Example.js");

    assert.equal(url.href, "https://example.test/application/components/Example.js?appcore-version=123");
});

test("preserves an existing appcore-version", () =>
{
    CoreLoader.setVersion("new");

    const url = CoreLoader._withVersion("file.css?appcore-version=existing");

    assert.equal(url.searchParams.get("appcore-version"), "existing");
});
