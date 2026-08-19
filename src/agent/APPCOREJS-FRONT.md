# APPCOREJS FRONT

Minimal frontend rules and facts.

## Frontend Architecture

Frontend architecture uses two distinct mechanisms:

* resource resolution;
* inheritance.

They are complementary but must not be confused.

## Frontend Structure Facts

* Project frontend root is `<project>/public`.
* `public/core` contains framework core frontend resources.
* `public/app` contains the application adaptation layer.
* Project-specific frontend resources normally live directly under `public`.
* `public/components` is the project component area.
* `public/js/io/Data.js` is created only when missing.

## Resource Resolution

Frontend resource resolution follows this exact order:

```text
<project>/public/
-> <project>/public/app/
-> <project>/public/core/
```

A resource found directly under `public` overrides the corresponding resource from `public/app`, which overrides the corresponding resource from `public/core`.

For normal files:

```text
<project>/public/<path>
<project>/public/app/<path>
<project>/public/core/<path>
```

Example:

```text
<project>/public/js/MyFile.js
<project>/public/app/js/MyFile.js
<project>/public/core/js/MyFile.js
```

For HTML files, `.tpl.html` variants are resolved before `.html` variants at each level.

Example for `index.html`:

```text
<project>/public/index.tpl.html
<project>/public/index.html
<project>/public/app/index.tpl.html
<project>/public/app/index.html
<project>/public/core/index.tpl.html
<project>/public/core/index.html
```

The same resolution principle applies to frontend resource directories such as:

```text
<project>/public/js/
<project>/public/css/
<project>/public/assets/
```

Template-specific resolution applies only to HTML resources.

A project does not need to duplicate framework resources when no customization is required. Missing project resources are resolved from `public/app`, then from `public/core`.

## Default Application Resolution

A newly created application can run using framework-provided resources.

For example, the resolved default index may come from:

```text
<project>/public/core/index.tpl.html
```

It can use the resolved application class:

```text
<project>/public/app/js/Application.js
```

and a framework-provided application template such as:

```text
<project>/public/core/application.tpl.html
```

The project only needs to create its own resource when it wants to override the resolved default.

Typical first project-level overrides are:

```text
<project>/public/index.tpl.html
<project>/public/application.tpl.html
<project>/public/manifest.json
```

## Inheritance

Inheritance is separate from resource resolution.

Resource resolution determines **which file is selected**.

Inheritance determines **which implementation extends another implementation**.

Typical framework inheritance:

```text
public/app/js/Application.js
    extends public/core/js/CoreApplication.js

public/app/js/Loader.js
    extends public/core/js/CoreLoader.js
```

Project frontend classes must inherit from the corresponding `public/app` class when one exists.

They must not inherit directly from `public/core` when a corresponding `public/app` class exists.

Example:

```text
public/js/MyComponent.js
    extends public/app/js/Component.js
```

## CSS Inheritance

CSS also uses explicit framework inheritance/import relationships independently from resource resolution.

Examples:

```text
public/app/css/application.css
    -> public/core/css/application.css

public/app/css/menu-component.css
    -> public/app/css/core-menu-component.css

public/app/css/theme.css
    -> public/app/css/core-theme.css
```

Do not confuse CSS inheritance/import relationships with resource resolution.

## Resolution vs Inheritance

Resolution and inheritance are two distinct mechanisms and may be used together.

* Resolution selects a resource according to:

```text
<project>/public/
-> <project>/public/app/
-> <project>/public/core/
```

* Inheritance extends an implementation from another layer.
* A project may override a resolved resource.
* A project may inherit from an `app` implementation.
* A project may use both mechanisms together.

Project-specific frontend resources should normally stay directly under `<project>/public`.

Override files under `<project>/public/app` only when the application adaptation layer itself must be customized.

## Synchronization Facts

* Front sync replaces `<project>/public/core`.
* Front sync preserves existing files in `<project>/public/app`.
* `public/ext` is synchronized only with `--ext` or `--intro`.
* `public/intro` is synchronized only with `--intro`.
