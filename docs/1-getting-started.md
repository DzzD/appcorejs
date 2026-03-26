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
npx app-core --model --database appcore --schema minimal_app --user appcore --password appcore
```

This command generates the model files required by the framework from the selected database & schema.

## Typical project layout

A typical AppCoreJS project is based on:

```text
app/
core/
public/
  app/
  core/
  index.js
index.js
```

The exact structure may vary depending on the use case.

## What to read next

To see how an AppCoreJS project is structured in practice, you can explore the available examples.

- [Examples](../examples/README.md)
- Or continue with the detailed [Installation](./2-installation.md) guide.