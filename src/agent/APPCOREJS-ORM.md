# APPCOREJS ORM

Minimal ORM rules and facts.

## Mandatory Layer Rule

In project code, model and ORM usage must go through app classes when app counterparts exist.
Project ORM code must not bypass app to use core ORM classes directly when app counterparts exist.

## Model Generation Facts

- `--model` generates core model classes in `core/db/models`.
- `--model` creates app model classes in `app/db/models` only when missing.
- Core model classes are regeneration targets.
- Generated core model metadata includes columns, primary keys, and foreign keys.

## Query Object Facts

- Base query object classes are `CoreDbQueryObject` and `DbQueryObject`.
- Query objects can compose multiple model objects and execute search over a configured query.

## Recommendation

Keep project-specific query composition in project query classes.
