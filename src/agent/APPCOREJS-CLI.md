# APPCOREJS CLI

Minimal generation reference for application development.

## Mandatory Option Rules

- `--project <name>` is required.
- `--intro` requires `--front`.
- `--ext` requires `--front`.

## Option Dependencies Applied by CLI

- `--model` implies `--back`.
- `--server` implies `--back`.
- `--intro` implies `--ext`.

## Main Options

- `--back`: synchronize backend layers.
- `--front`: synchronize `<project>/public` layers.
- `--server`: create/synchronize server entry and project server class.
- `--model`: generate ORM model files from database metadata.
- Agent files are synchronized by default from `src/agent` to `<target>/agent/appcorejs`.
- `--no-agent-files`: disable agent file synchronization.
- `--target <dir>`: optional destination root; default is current directory.
- `--model-prefix <prefix>`: model class prefix; defaults to the database name.
- `--model-noprefix`: generate model names without a prefix.
- `--dbschema <schemas>`: comma-separated schemas; defaults to `ALL`.

When `--model` is used, `--dbuser`, `--dbpassword`, and `--dbname` are required.

## Synchronization Facts

- Backend synchronization replaces `<target>/core`, preserves `<target>/app`, and creates the project directory.
- Frontend synchronization replaces `<target>/<project>/public/core` and preserves existing project and `public/app` files.
- `public/js/io/Data.js`, root `server.js`, and the project server class are created only when missing.
- Core model classes are regenerated. App model classes are one-shot generated and preserved.
- `public/ext` is included only with `--ext` or `--intro`; `public/intro` is included only with `--intro`.

## Recommendation

Re-run only the generators needed by the change. Never place custom changes in a replaced `core` directory.
