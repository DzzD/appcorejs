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
```

Then install AppCoreJS:

```bash
npm install app-core
```

If AppCoreJS is used locally and not yet published on npm, you can install it from a local path instead:

```bash
npm install ../app-core
```

## Minimal package.json

AppCoreJS is distributed as an ES module package.  
Your project must therefore use ES modules too:

```json
{
    "type": "module"
}
```

A more complete minimal example:

`package.json`
```js
{
  "name": "my-app",
  "type": "module",
  "dependencies": {
    "@app-core/framework": "file:../.."
  },
  "scripts": {
    "start": "node index.js"
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
npx app-core 
```

## Notes

- `app-core` is exposed as a CLI command through the package `bin` entry
- `npx app-core ...` is the recommended way to run the generator manually
- the framework is currently intended for private usage, experimentation, and prototyping

## Status

AppCoreJS is currently under heavy development.

At this stage, the backend foundation is usable for experimentation and prototype work, but the frontend layer is not yet available as a distributable part of the framework.

The frontend architecture is intended to follow the exact same philosophy as the backend:

- strict separation between Core and App
- immutable framework base
- application-side overrides only
- no direct modification of Core files

## Next step

Continue with [Architecture](./3-architecture.md).