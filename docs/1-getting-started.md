# Getting Started

This guide shows the minimum steps required to start using **AppCoreJS**.

## Prerequisites

Before using AppCoreJS, make sure you have:

- Node.js installed
- npm installed
- access to a PostgreSQL database
- an existing database schema
- a valid `package.json` in your project

## Install dependencies

`package.json`
```js
{
  "name": "my-app",
  "type": "module",
  "dependencies": {
    "@app-core/framework": "file:../.." //set path of appcorejs folder
  },
  "scripts": {
    "start": "node index.js"
  }
}
```

Once your `package.json` is ready, install the project dependencies from the project root:

```
npm install
```

See [Installation](./2-installation.md) for more details.

## Generate a model

Once dependencies are installed, generate your application model from a database schema:

```
npx app-core --database appcore --schema minimal_app --user appcore --password appcore
```

This command generates the model files required by the framework from the selected schema.

## Typical project layout

A typical AppCoreJS project is based on:

```text
app/
core/
index.js
```

Depending on the project, additional files and directories may be present.

## What to read next

You can also look at the available examples to see how an AppCoreJS project is structured in practice.

- [Examples](../exemples/README.md)