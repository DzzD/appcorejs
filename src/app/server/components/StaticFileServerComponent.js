import fs from 'node:fs/promises';
import path from 'node:path';
import { CoreStaticFileServerComponent } from "../../../core/server/components/CoreStaticFileServerComponent.js";

export class StaticFileServerComponent extends CoreStaticFileServerComponent
{
    async processTemplate(content)
    {
        content = content.replaceAll("{{APPCORE_APP_NAME}}", this.server.appName);

        const base = path.join(this.staticDirectory, 'assets/tpl');

        const devBadge = this.server.devModeEnabled ? await fs.readFile(path.join(base, 'appcore-dev-mode-badge.tpl.html'), 'utf8') : '';

        const loader = await fs.readFile(path.join(base, 'appcore-application-loader.tpl.html'), 'utf8');
          
        content = content
            .replace("<!--{{APPCORE_DEV_MODE_BADGE}}-->", devBadge)
            .replace("<!--{{APPCORE_APPLICATION_LOADER}}-->", loader);

        return content;
    }
}