

# 002 - Architecture

![AppCore<sub>JS</sub> Architecture](./images/global-design.png)

AppCoreJS is built on 3 layers.

```text
project -> app -> core
```

## Root folders

```text
./core/
./app/
./<project>/
```

- `./core/`: internal framework engine, not a public API.
- `./app/`: mandatory framework interface used by project code.
- `./<project>/`: business code and project-specific runtime code.

## Frontend folders

```text
./<project>/public/
  core/
  app/
  assets/
  ext/
  components/
```

- `public/core/`: frontend engine internals.
- `public/app/`: frontend interface layer.
- `public/assets/`: static files only (images, icons, fonts, manifest assets).
- `public/ext/`: external modules/components.
- `public/components/`: reusable project components.

## Why this split?

- `core` stays replaceable and stable.
- `app` is one control point for global behavior.
- `project` isolates business logic.

This prevents framework internals and business code from mixing.

## Mandatory usage rule

Project code imports from `app`.
Project code does not import from `core`.

## Important detail about `app` classes

In many domains, classes in `app/*` are intentionally minimal by default.

That is expected.

They exist as project-level override points.

You customize behavior in `app` to apply global rules.
You customize behavior in `./<project>/` to apply business-specific rules.

## Cross-reference

- CLI behavior: [001 - app-core CLI](./001-app-core-cli.md)
- Backend concepts: [003 - Backend](./003-backend.md)
- ORM details: [004 - Model / ORM](./004-model-orm.md)
- Server details: [005 - Server](./005-server.md)
- Frontend details: [006 - Frontend](./006-0-frontend.md)
