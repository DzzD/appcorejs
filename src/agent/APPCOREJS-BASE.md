# APPCOREJS BASE

## File Ownership

| Location | Lifecycle | Application rule |
| --- | --- | --- |
| `core/` | Replaced by synchronization | Read when necessary; never edit |
| `app/` | Created once or copied without overwrite | Modify for behavior shared by the application |
| `<project>/` | Created once or project-owned | Put business-specific behavior here |
| `<project>/public/core/` | Replaced by frontend synchronization | Never edit |
| `<project>/public/app/` | Copied without overwrite | Modify application-wide frontend behavior |
| `<project>/public/` outside `core/` and `app/` | Project-owned | Put project frontend resources here |
| `agent/appcorejs/` | Re-synchronized documentation | Read only; edit the framework source documentation instead |

Files marked `ONE-SHOT GENERATED FILE` are created only when missing. They are intended to be freely modified after their first generation.

As a practical safeguard, hide `core/` directories in the IDE explorer. They remain available for inspection when framework behavior must be understood.

## Inheritance and Overrides

The normal direction is:

```text
project class -> app class -> core class
```

Examples:

```text
project ServerComponent -> app/server/ServerComponent -> core/server/CoreServerComponent
project frontend component -> public/app/js/Component -> public/core/js/CoreComponent
app/db/DbConnector -> core/db/CoreDbConnector
```

Generated database models use an additional generated level:

```text
optional project model
-> app/db/models/Model                 one-shot, editable
-> core/db/models/CoreModel            regenerated, read-only
-> app/db/DbObject                     global editable override
-> core/db/CoreDbObject                framework implementation
```

Use the nearest application-facing parent. Put transversal behavior in `app`; put behavior specific to one project or feature in `<project>`.
