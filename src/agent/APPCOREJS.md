# APPCOREJS

AppCoreJS generates a layered application. Develop through the application-facing layers, not through framework internals.

## Mandatory Direction

```text
project -> app -> core
```

- `core/`: synchronized framework implementation. It may be replaced; do not edit it.
- `app/`: preserved application-wide overrides and extension points.
- `<project>/`: preserved business-specific server, database, and frontend code.

Project code imports the corresponding `app` class whenever one exists. It must not bypass that class to import `core` directly.

## Where to Start

- File ownership and inheritance: `APPCOREJS-BASE.md`
- CLI generation and synchronization: `APPCOREJS-CLI.md`
- Frontend resolution, lifecycle, and `Data`: `APPCOREJS-FRONT.md`
- Default frontend components: `APPCOREJS-FRONT-COMPONENTS.md`
- Server components and APIs: `APPCOREJS-SERVER.md`
- PostgreSQL models and queries: `APPCOREJS-ORM.md`
- Complete PostgreSQL Hello World: `APPCOREJS-HELLO-WORLD.md`
