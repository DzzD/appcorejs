![AppCore<sub>JS</sub> logo](./docs/images/app-core-logo-1024.png)



# AppCore<sub>JS</sub> Framework

AppCore<sub>JS</sub> is a framework for building Node.js / PostgreSQL / HTML5 / CSS / JavaScript applications.

Its architecture is based on two strict principles:

- strict separation between `core/` and `app/`
- no direct use of Core classes

AppCore<sub>JS</sub> enforces a clear boundary between:

- `src/core/`: immutable framework base classes and internal framework logic
- `src/app/`: application-level classes for extending, specializing, and exposing framework behavior
- `src/public/`: public frontend assets and files
- `src/public/app/`: application-specific frontend files
- `src/public/core/`: core frontend files
- `src/public/ext/`: external frontend components
- `bin/`: CLI entry points, including the `app-core` generator (`AppCore.js`)

Developers work only through the `app/` layer.  
Core classes are never used directly, not even by the framework itself.

This keeps the Core layer immutable while ensuring that all behavior remains extensible from the App layer, including inside the framework itself, so the framework can be patched without ever modifying the Core layer.

## Philosophy

AppCore<sub>JS</sub> is designed to stay focused, understandable, and maintainable over time.

It is not intended to solve every possible use case, support every kind of application, or abstract every database system behind a universal model. This is a deliberate design choice.

Rather than trying to be a framework for everything, AppCore<sub>JS</sub> focuses on a well-defined application stack and a small set of simple architectural rules.

AppCore<sub>JS</sub> is both a framework and a development method.

Its goal is not to do more, but to do fewer things in a more consistent, more explicit, and more maintainable way.

This helps reduce technical debt, avoids "factory-gas-plant" framework complexity, and keeps the framework code easier to understand, debug, and evolve.

Because the architecture is based on simple and explicit rules, the framework remains easier to port when needed, both across programming languages and across storage backends.

AppCore<sub>JS</sub> follows an architectural approach that has evolved since 2003 through earlier versions developed in PHP, Java, and ActionScript, before being ported to Node.js. It has been used in both web and desktop applications, and adapted over time to multiple storage systems including MySQL, Oracle, and even flat-file JSON storage.

## Key Principles

- strict separation between framework code and application code
- immutable Core layer
- no direct use of Core classes
- application-level extension through `app/` classes only
- predictable project structure
- synchronization and code generation managed by the framework
- safer framework evolution over time

## Project Structure

    src/core/
      Immutable framework code

    src/app/
      User-extensible façade classes and project-specific overrides

    bin/
      CLI entry points and framework scripts

    examples/
      Sample applications demonstrating framework usage

## How It Works

AppCore<sub>JS</sub> is not intended to be used as a traditional library where developers work directly with framework internals.

Instead, it combines project structure, synchronization, and architectural rules to enforce a strict separation between framework-owned code and application-owned code.

In practice, AppCore<sub>JS</sub>:

- initializes and maintains a consistent project structure
- synchronizes framework-managed files and classes
- preserves the immutability of the Core layer
- exposes extension and specialization points through the App layer
- ensures that Core classes are never used directly, including by the framework itself
- can regenerate Data Objects at any time directly from the database schema, using the database as the source of truth, without overwriting application-level customizations in most cases
- provides a CLI entry point (`app-core`) for project setup, synchronization, and future framework features

## Installation

AppCore<sub>JS</sub> is installed as a Node.js package.

Depending on the distribution mode, it can be installed from a local package, a packaged archive, a private Git repository, or a package registry.

During installation, AppCore<sub>JS</sub> can automatically initialize or synchronize the target project through its installation script.

Example using a local package:

    npm install file:../app-corejs

Example using a packaged archive:

    npm install file:./libs/app-corejs-1.0.0.tgz

## Usage

AppCore<sub>JS</sub> provides a CLI entry point:

    app-core

Example usage:

    npx app-core --nomodel

Or through an npm script:

    {
      "scripts": {
        "app-core": "app-core"
      }
    }

## Architecture

AppCore<sub>JS</sub> is built around a strict two-layer architecture:

- `src/core/` contains immutable framework base classes and internal framework logic
- `src/app/` contains application-level subclasses used for customization, specialization, and framework extension

In this architecture:

- `core/` must never be modified directly
- Core classes are never used directly, including by the framework itself
- all customization and extension happen through `app/` classes
- synchronization tooling updates framework-managed files while preserving application-level customizations in most cases

This model keeps responsibilities clear and helps preserve a clean, understandable, and maintainable upgrade path.

## Documentation

- [Getting Started](./docs/1-getting-started.md)
- [Installation](./docs/2-installation.md)
- [Architecture](./docs/3-architecture.md)
- [CLI app-core](./docs/4-app-core.md)

## Status

AppCore is currently intended for private usage, experimentation, and controlled integration across projects.

## Author

Bruno Augier (aka DzzD)

