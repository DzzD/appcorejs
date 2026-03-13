import fs from 'node:fs/promises';
import path from 'node:path';

async function copyDirectory(sourceDir, destinationDir)
{
    await fs.mkdir(destinationDir, { recursive: true });

    const entries = await fs.readdir(sourceDir, { withFileTypes: true });

    for (const entry of entries)
    {
        const sourcePath = path.join(sourceDir, entry.name);
        const destinationPath = path.join(destinationDir, entry.name);

        if (entry.isDirectory())
        {
            await copyDirectory(sourcePath, destinationPath);
            continue;
        }

        await fs.copyFile(sourcePath, destinationPath);
    }
}

function splitIntoSegments(text)
{
    return String(text)
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter((segment) => segment.length > 0);
}

function toPascalCase(text)
{
    const segments = splitIntoSegments(text);

    return segments
        .map((segment) =>
        {
            const lower = segment.toLowerCase();
            return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join('');
}

function toCamelCase(text)
{
    const segments = splitIntoSegments(text);

    if (segments.length === 0)
    {
        return '';
    }

    const [first, ...rest] = segments;
    const firstLower = first.toLowerCase();

    return firstLower + rest.map((segment) =>
    {
        const lower = segment.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    }).join('');
}

export { copyDirectory, toPascalCase, toCamelCase };
