# Architecture

AppCoreJS is built around a strict architectural rule:

- the framework Core is immutable
- all customization happens from the application layer
- Core files must never be modified

This architecture is designed to keep the framework stable, patchable, and fully extensible without ever breaking the separation between framework internals and project-specific code.

## Core / App separation

AppCoreJS is split into two distinct layers:

- `core/`: internal framework base classes and internal logic
- `app/`: application-level classes that extend, specialize, and expose framework behavior

The `core/` layer contains the framework foundation.  
It is not intended to be modified.

The `app/` layer is the only customization layer.  
All project-specific behavior must be implemented there.

This means:

- no business code inside `core/`
- no direct patching of framework files
- no direct use of Core classes from application code

## Extension model

AppCoreJS does not rely on direct modification of framework internals.

Instead, framework behavior is exposed and specialized through the App layer.

In practice, Core classes are relayed by App classes, and the framework itself uses these App classes rather than using Core classes directly.

This means that framework behavior can be modified, extended, or overridden from the application layer without ever changing Core files.

This ensures that:

- framework updates remain safe
- project code stays isolated
- overrides remain explicit
- behavior can be specialized without forking the framework
- the framework itself remains patchable without breaking application customizations

## Backend philosophy

The current implementation mainly focuses on the backend foundation.

It is designed around:

- Node.js
- PostgreSQL
- ES modules
- class-based extension
- strict separation between generated code and modifiable code

## Generated / modifiable structure

AppCoreJS distinguishes between framework-managed files and developer-managed files.

Generated files provide the structural base of the application.  
Modifiable files are the place where developers add or override behavior.

This approach helps preserve regeneration safety while keeping the project fully customizable.

## Frontend philosophy

The frontend layer is currently under finalization and is not yet distributed as part of the framework.

It is intended to follow the exact same architectural philosophy as the backend:

- strict Core / App separation
- immutable Core layer
- all customization from the App layer
- no direct modification of Core files

## Goal

The main goal of AppCoreJS is to provide a framework that can evolve without forcing projects to patch or fork its internal foundation.

The application must remain the only place where customization happens, while the framework itself stays replaceable and maintainable.

## Next step

Continue with [AppCore CLI](./4-app-core.md), which explains how the `app-core` binary works and how it is used to initialize and generate an application structure.
