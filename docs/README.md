# AppCoreJS Documentation

This folder is the official documentation for AppCoreJS.

Read files in numeric order.
The order goes from basic usage to advanced internals.

## Recommended reading order

1. [001 - app-core CLI](./001-app-core-cli.md)
2. [002 - Architecture](./002-architecture.md)
3. [003 - Backend](./003-backend.md)
4. [004 - Model / ORM](./004-model-orm.md)
5. [005 - Server](./005-server.md)
6. [006 - Frontend](./006-frontend.md)
7. [007 - Examples](./007-examples.md)

## Core rule to keep in mind

```text
project -> app -> core
```

- `app` is mandatory.
- `core` is internal.
- project code must not use `core` directly.
