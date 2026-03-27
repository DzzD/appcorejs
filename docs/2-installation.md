# Installation

AppCoreJS is currently intended for private usage, experimentation, and prototype projects.

## Prerequisites

Before using AppCoreJS, make sure you have:

- [Node.js](https://nodejs.org/) 18 or newer
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/) 16 or newer

## Create a project

Initialize a new Node.js project:

```bash
npm init -y
npm pkg set type=module
```

If your npm version does not support `npm pkg`, edit `package.json` manually and add:

```json
{
    "type": "module"
}
```

Then install AppCoreJS:

```bash
npm install app-core
```

If AppCoreJS is used locally and not yet published on npm, you can install it from a local path instead:

```bash
npm install ../app-core
```

To install AppCoreJS directly from the GitHub repository:

```bash
npm install git+https://github.com/DzzD/appcorejs.git
```

## Minimal package.json

A minimal `package.json` after running the commands above looks like:

`package.json`
```js
{
  "name": "my-app",
  "type": "module",
  "dependencies": {
    "app-core": "^1.0.0"
  },
  "scripts": {
    "start": "node server.js"
  }
}
```

## Generate the model

Once AppCoreJS is installed, generate the application model with:

```bash
npx app-core --model --dbname appcore --dbschema minimal_app --dbuser appcore --dbpassword appcore
```

To only initialize the framework structure without generating a model structure :

```bash
npx app-core --back
```

## Notes

- `app-core` is exposed as a CLI command through the package `bin` entry
- `npx app-core ...` is the recommended way to run the generator manually
- the framework is currently intended for private usage, experimentation, and prototyping

## Status

AppCoreJS is fully functional but still in an early beta phase.

Both backend and frontend layers follow the same philosophy:

- strict separation between Core and App
- immutable framework base
- application-side overrides only
- no direct modification of Core files

Synchronisation commands let you refresh the baseline (for example regenerating models after database changes) without losing application-specific overrides.

## Next step

Continue with [Architecture](./3-architecture.md).
