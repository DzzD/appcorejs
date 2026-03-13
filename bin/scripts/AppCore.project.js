import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { Log } from '../../src/app/Log.js';
import { copyDirectory } from './AppCore.helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initialiseProject()
{
    Log.info('[app-core] Project initialisation...');

    const frameworkRoot = path.resolve(__dirname, '..', '..');
    const sourceApp = path.join(frameworkRoot, 'src', 'app');
    const sourceCore = path.join(frameworkRoot, 'src', 'core');
    const targetApp = path.resolve(process.cwd(), 'app');
    const targetCore = path.resolve(process.cwd(), 'core');

    await copyDirectory(sourceApp, targetApp);
    await copyDirectory(sourceCore, targetCore);

    Log.info('[app-core] Project initialisation completed');
}
