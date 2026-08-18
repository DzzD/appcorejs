# APPCOREJS

AppCoreJS is a JavaScript framework and generator based on layered overrides.

## Mandatory Architecture Rule

project -> app -> core

- core is the internal framework implementation layer.
- app is the required adaptation and override layer.
- project is the business-specific layer.

Project code must use the corresponding app layer and must not bypass it to access core directly when an app counterpart exists.

## Rule Classification

- Mandatory rule: respect layer direction and boundaries.
- Descriptive fact: app and project layers are intended extension points.
- Recommendation: keep business behavior in project and global behavior in app.

## Index

- CLI behavior and synchronization rules: APPCOREJS-CLI.md
- Shared base classes and lifecycle: APPCOREJS-BASE.md
- ORM models and query objects: APPCOREJS-ORM.md
- Server architecture and components: APPCOREJS-SERVER.md
- Frontend layers, App, Data, templates: APPCOREJS-FRONT.md
