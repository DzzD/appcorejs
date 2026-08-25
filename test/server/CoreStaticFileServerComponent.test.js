import assert from "node:assert/strict";
import fs from "node:fs/promises";
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
