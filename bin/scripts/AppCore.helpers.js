/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

import fs from 'node:fs/promises';
import path from 'node:path';

async function copyDirectory(sourceDir, destinationDir, overrideOrOptions = false)
{
    const options = typeof overrideOrOptions === 'boolean' ? { override: overrideOrOptions } : overrideOrOptions ?? {};
    const override = options.override === undefined ? false : Boolean(options.override);
    const coreOverride = options.coreOverride === undefined ? true : Boolean(options.coreOverride);
    const exclusionsInput = Array.isArray(options.exclusions) ? options.exclusions : [];
    const normalisedExclusions = exclusionsInput
        .map((exclusion) => String(exclusion).trim())
        .filter((exclusion) => exclusion.length > 0)
        .map((exclusion) => exclusion.replace(/\\/g, '/').toLowerCase());

    function isExcluded(relativePath)
    {
        if (!relativePath)
        {
            return false;
        }

        const normalisedRelativePath = relativePath.replace(/\\/g, '/').toLowerCase();

        return normalisedExclusions.some((exclusion) =>
        {
            return normalisedRelativePath === exclusion || normalisedRelativePath.startsWith(`${exclusion}/`);
        });
    }

    async function traverse(currentSourceDir, currentDestinationDir, insideCore)
    {
        await fs.mkdir(currentDestinationDir, { recursive: true });

        const entries = await fs.readdir(currentSourceDir, { withFileTypes: true });

        for (const entry of entries)
        {
            const sourcePath = path.join(currentSourceDir, entry.name);
            const destinationPath = path.join(currentDestinationDir, entry.name);
            const relativePath = path.relative(sourceDir, sourcePath);

            if (isExcluded(relativePath))
            {
                continue;
            }

            const entryNameLower = entry.name.toLowerCase();
            const isCoreDirectory = entry.isDirectory() && entryNameLower.startsWith('core');
            const nextInsideCore = insideCore || isCoreDirectory;

            if (entry.isDirectory())
            {
                await traverse(sourcePath, destinationPath, nextInsideCore);
                continue;
            }

            const shouldOverwrite = override || (coreOverride && (insideCore || entryNameLower.startsWith('core')));

            if (!shouldOverwrite)
            {
                try
                {
                    await fs.access(destinationPath);
                    continue;
                }
                catch
                {
                }
            }

            await fs.copyFile(sourcePath, destinationPath);
        }
    }

    await traverse(sourceDir, destinationDir, false);
}

async function copyFileIfMissing(sourcePath, destinationPath)
{
    try
    {
        await fs.access(destinationPath);
        return;
    }
    catch
    {
    }

    await fs.copyFile(sourcePath, destinationPath);
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

function pluralizeName(value)
{
    if (value.endsWith('s'))
    {
        return value;
    }

    return `${value}s`;
}

function resolveProjectRoot()
{
    return process.cwd();
}

export { copyDirectory, copyFileIfMissing, toPascalCase, toCamelCase, pluralizeName, resolveProjectRoot };
