/**
 * AppCoreJS Framework
 * CORE LAYER
 * NOT INTENDED TO BE MODIFIED IN APPLICATION PROJECTS
 * Copyright (c) 2026 Bruno Augier
 * Licensed under the MIT License
 */

export class CoreLog
{
    static modes =
    {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
    };
    static #mode = CoreLog.modes.debug;

    static setMode(mode)
    {
        if (!Object.prototype.hasOwnProperty.call(CoreLog.modes, mode))
        {
            throw new Error('Invalid log mode: ' + mode);
        }

        CoreLog.#mode = CoreLog.modes[mode];
    }

    static debug(...args)
    {
        if (CoreLog.#mode > CoreLog.modes.debug)
        {
            return;
        }

        console.debug(...args);
    }


    static info(...args)
    {
        if (CoreLog.#mode > CoreLog.modes.info)
        {
            return;
        }

        console.info(...args);
    }


    static warn(...args)
    {
        if (CoreLog.#mode > CoreLog.modes.warn)
        {
            return;
        }

        console.warn(...args);
    }


    static error(...args)
    {
        if (CoreLog.#mode > CoreLog.modes.error)
        {
            return;
        }

        console.error(...args);
    }
}
