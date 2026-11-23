import assert from "node:assert/strict";
import express from "express";
import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { CoreStaticFileServerComponent } from "../../src/core/server/components/CoreStaticFileServerComponent.js";

async function createComponent(context)
{
    const baseDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "appcore-static-test-"));
    const publicDirectory = path.join(baseDirectory, "public");
    const component = new CoreStaticFileServerComponent();
    component.server = { baseDirectory };

    await fs.mkdir(path.join(publicDirectory, "app"), { recursive: true });
    await fs.mkdir(path.join(publicDirectory, "core"), { recursive: true });

    context.after(async () =>
    {
        await fs.rm(baseDirectory, { recursive: true, force: true });
    });

    return { component, publicDirectory };
}

async function createServer(context)
{
    const { component, publicDirectory } = await createComponent(context);
    const application = express();
    component.server.application = application;
    await component.start();
    application.use((request, response) => response.status(404).send("Not Found"));

    const server = http.createServer(application);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    context.after(() => new Promise((resolve) => server.close(resolve)));

    const address = server.address();
    const request = (requestPath) => new Promise((resolve, reject) =>
    {
        const clientRequest = http.request(
            { host: "127.0.0.1", port: address.port, path: requestPath },
            (response) =>
            {
                const chunks = [];
                response.on("data", (chunk) => chunks.push(chunk));
                response.on("end", () => resolve({
                    statusCode: response.statusCode,
                    body: Buffer.concat(chunks).toString(),
                }));
            },
        );
        clientRequest.on("error", reject);
        clientRequest.end();
    });

    return { component, publicDirectory, request };
}

test("resolves the default core service-worker.js", async (context) =>
{
    const { component, publicDirectory } = await createComponent(context);
    const expectedContent = "core worker";
    await fs.writeFile(path.join(publicDirectory, "core", "service-worker.js"), expectedContent);

    const result = await component.getStaticFile(path.join(publicDirectory, "service-worker.js"), { path: "/service-worker.js" });

    assert.equal(result.content.toString(), expectedContent);
});

test("allows app/service-worker.js to override the core entry", async (context) =>
{
    const { component, publicDirectory } = await createComponent(context);
    await fs.writeFile(path.join(publicDirectory, "core", "service-worker.js"), "core worker");
    await fs.writeFile(path.join(publicDirectory, "app", "service-worker.js"), "app worker");

    const result = await component.getStaticFile(path.join(publicDirectory, "service-worker.js"), { path: "/service-worker.js" });

    assert.equal(result.content.toString(), "app worker");
});

test("allows a project service-worker.js to override app and core entries", async (context) =>
{
    const { component, publicDirectory } = await createComponent(context);
    await fs.writeFile(path.join(publicDirectory, "core", "service-worker.js"), "core worker");
    await fs.writeFile(path.join(publicDirectory, "app", "service-worker.js"), "app worker");
    await fs.writeFile(path.join(publicDirectory, "service-worker.js"), "project worker");

    const result = await component.getStaticFile(path.join(publicDirectory, "service-worker.js"), { path: "/service-worker.js" });

    assert.equal(result.content.toString(), "project worker");
});

test("propagates appcore-version to JavaScript dependencies", async (context) =>
{
    const { component, publicDirectory } = await createComponent(context);
    const source = [
        'import "./side-effect.js";',
        'import { Value } from "../Value.js?mode=test#value";',
        'export { Other } from "/shared/Other.js";',
        'const Lazy = import("./Lazy.js");',
        'import "https://cdn.example.test/library.js";',
        'import "./Current.js?appcore-version=11";'
    ].join("\n");
    const fileName = path.join(publicDirectory, "Application.js");
    await fs.writeFile(fileName, source);

    const result = await component.getStaticFile(fileName,
    {
        path: "/Application.js",
        query: { "appcore-version": "12" }
    });

    assert.match(result.content, /\.\/side-effect\.js\?appcore-version=12/);
    assert.match(result.content, /\.\.\/Value\.js\?mode=test&appcore-version=12#value/);
    assert.match(result.content, /\/shared\/Other\.js\?appcore-version=12/);
    assert.match(result.content, /\.\/Lazy\.js\?appcore-version=12/);
    assert.match(result.content, /https:\/\/cdn\.example\.test\/library\.js/);
    assert.match(result.content, /\.\/Current\.js\?appcore-version=11/);
});

test("propagates appcore-version to CSS imports and resources", async (context) =>
{
    const { component, publicDirectory } = await createComponent(context);
    const source = [
        '@import "./theme.css";',
        '@import url("../layout.css?mode=wide");',
        'src: url("../fonts/font.woff2#font");',
        'background: url(data:image/png;base64,abc);'
    ].join("\n");
    const fileName = path.join(publicDirectory, "styles.css");
    await fs.writeFile(fileName, source);

    const result = await component.getStaticFile(fileName,
    {
        path: "/styles.css",
        query: { "appcore-version": "12" }
    });

    assert.match(result.content, /\.\/theme\.css\?appcore-version=12/);
    assert.match(result.content, /\.\.\/layout\.css\?mode=wide&appcore-version=12/);
    assert.match(result.content, /\.\.\/fonts\/font\.woff2\?appcore-version=12#font/);
    assert.match(result.content, /data:image\/png;base64,abc/);
});

test("propagates appcore-version to HTML resources", async (context) =>
{
    const { component, publicDirectory } = await createComponent(context);
    const source = [
        '<script src="./Application.js"></script>',
        '<link href="/styles.css?theme=dark" rel="stylesheet">',
        '<img src="data:image/png;base64,abc" poster="#preview">',
        '<source srcset="./small.png 1x, ./large.png?quality=90 2x">'
    ].join("\n");
    const fileName = path.join(publicDirectory, "page.html");
    await fs.writeFile(fileName, source);

    const result = await component.getStaticFile(fileName,
    {
        path: "/page.html",
        query: { "appcore-version": "12" }
    });

    assert.match(result.content, /\.\/Application\.js\?appcore-version=12/);
    assert.match(result.content, /\/styles\.css\?theme=dark&appcore-version=12/);
    assert.match(result.content, /data:image\/png;base64,abc/);
    assert.match(result.content, /poster="#preview"/);
    assert.match(result.content, /\.\/small\.png\?appcore-version=12 1x, \.\/large\.png\?quality=90&appcore-version=12 2x/);
});

test("does not rewrite dependencies of an unversioned response", async (context) =>
{
    const { component, publicDirectory } = await createComponent(context);
    const source = 'import "./Dependency.js";';
    const fileName = path.join(publicDirectory, "Application.js");
    await fs.writeFile(fileName, source);

    const result = await component.getStaticFile(fileName, { path: "/Application.js", query: {} });

    assert.equal(result.content.toString(), source);
});

test("does not alter a versioned binary resource", async (context) =>
{
    const { component, publicDirectory } = await createComponent(context);
    const source = Buffer.from([0x00, 0xff, 0x89, 0x50, 0x4e, 0x47]);
    const fileName = path.join(publicDirectory, "image.png");
    await fs.writeFile(fileName, source);

    const result = await component.getStaticFile(fileName,
    {
        path: "/image.png",
        query: { "appcore-version": "12" }
    });

    assert.equal(Buffer.isBuffer(result.content), true);
    assert.deepEqual(result.content, source);
});

test("serves an allowed static file", async (context) =>
{
    const { publicDirectory, request } = await createServer(context);
    await fs.writeFile(path.join(publicDirectory, "allowed.txt"), "allowed content");

    const response = await request("/allowed.txt");

    assert.equal(response.statusCode, 200);
    assert.equal(response.body, "allowed content");
});

test("rejects traversal, absolute, hidden, and malformed request paths", async (context) =>
{
    const { component, publicDirectory, request } = await createServer(context);
    const outsideDirectory = path.dirname(publicDirectory);
    await fs.writeFile(path.join(outsideDirectory, "outside.txt"), "outside marker");
    await fs.mkdir(path.join(outsideDirectory, "public-other"), { recursive: true });
    await fs.writeFile(path.join(outsideDirectory, "public-other", "prefix.txt"), "prefix marker");
    await fs.mkdir(path.join(publicDirectory, "dir"), { recursive: true });
    await fs.writeFile(path.join(publicDirectory, "dir", ".secret"), "secret marker");

    const invalidPaths = [
        "/../../.env",
        "/%2e%2e/%2e%2e/.env",
        "/%252e%252e/%252e%252e/.env",
        "/..\\..\\.env",
        "/%2e%2e%5c%2e%2e%5c.env",
        "/C:%5cWindows%5cwin.ini",
        "/../public-other/prefix.txt",
        "/.env",
        "/dir/.secret",
        "/%E0%A4%A",
    ];

    for (const invalidPath of invalidPaths)
    {
        const response = await request(invalidPath);
        assert.equal(response.statusCode, 404, invalidPath);
        assert.equal(response.body, "Not Found", invalidPath);
        assert.doesNotMatch(response.body, /outside marker|prefix marker|secret marker|appcore-static-test-|ENOENT|Error:/);
    }

    assert.throws(() => component.resolvePath(path.join("..", "public-other", "prefix.txt")));
});

test("rejects a symbolic link that leaves the static directory", async (context) =>
{
    const { publicDirectory, request } = await createServer(context);
    const outsideFile = path.join(path.dirname(publicDirectory), "outside.txt");
    const linkFile = path.join(publicDirectory, "linked.txt");
    await fs.writeFile(outsideFile, "outside marker");

    try
    {
        await fs.symlink(outsideFile, linkFile, "file");
    }
    catch (error)
    {
        if (process.platform === "win32" && ["EPERM", "EACCES"].includes(error.code))
        {
            context.skip("Symbolic links require Windows Developer Mode or elevated privileges");
            return;
        }

        throw error;
    }

    const response = await request("/linked.txt");

    assert.equal(response.statusCode, 404);
    assert.equal(response.body, "Not Found");
    assert.doesNotMatch(response.body, /outside marker|appcore-static-test-|Error:/);
});

test("normalizes legitimate encoded paths", () =>
{
    const component = new CoreStaticFileServerComponent();
    const rootPath = path.resolve("public");
    assert.equal(component.resolvePath("/dir/file%20name.txt", rootPath), path.join(rootPath, "dir", "file name.txt"));
    assert.equal(component.resolvePath("/", rootPath), path.join(rootPath, "index.html"));
});
