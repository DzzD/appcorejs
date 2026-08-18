# APPCOREJS BASE

Shared base rules and facts.

## Mandatory Layer Rule

project -> app -> core

Project classes must import app classes when an app counterpart exists.
Project classes must not import core classes directly when an app counterpart exists.

## Base Class Pattern (Fact)

- App classes extend core classes.
- Typical pairs: `DbObject`/`CoreDbObject`, `DbQueryObject`/`CoreDbQueryObject`, `Server`/`CoreServer`, `ServerComponent`/`CoreServerComponent`.

## File Lifecycle (Fact)

- Core files are synchronization-managed and may be replaced.
- App files are generated as extension points and are preserved when already present.

## Recommendation

Put cross-project behavior in app and business-specific behavior in project.
