import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { synchroniseFrontend } from "../../bin/scripts/AppCore.front.js";

const frameworkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

test("generates and preserves the application Service Worker extension", async (context) =>
{
    const projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), "appcore-front-test-"));
    const projectName = "example";
    const serviceWorkerPath = path.join(projectRoot, projectName, "public", "app", "js", "ServiceWorker.js");
    const coreEntryPath = path.join(projectRoot, projectName, "public", "core", "service-worker.js");
    const customContent = "export class ServiceWorker {}\n";

    context.after(async () =>
    {
        await fs.rm(projectRoot, { recursive: true, force: true });
    });

    await synchroniseFrontend(frameworkRoot, projectRoot, projectName);

    const generatedContent = await fs.readFile(serviceWorkerPath, "utf8");
    const coreEntryContent = await fs.readFile(coreEntryPath, "utf8");
    assert.match(generatedContent, /extends CoreServiceWorker/);
    assert.match(coreEntryContent, /from "\.\/app\/js\/ServiceWorker\.js"/);

    await fs.writeFile(serviceWorkerPath, customContent);
    await synchroniseFrontend(frameworkRoot, projectRoot, projectName);

    assert.equal(await fs.readFile(serviceWorkerPath, "utf8"), customContent);
});
