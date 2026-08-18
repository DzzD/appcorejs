# APPCOREJS CLI

Minimal reference for `app-core`.

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
- Agent files are synchronized by default from `src/agent` to `<project>/agent`.
- `--no-agent-files`: disable agent file synchronization.
- `--target <dir>`: optional destination root; default is current directory.

When `--model` is used, `--dbuser`, `--dbpassword`, and `--dbname` are required.

## Synchronization Facts

- Backend sync replaces `<target>/core` and preserves existing files in `<target>/app`.
- Frontend sync replaces `<target>/<project>/public/core` and preserves existing files in `<target>/<project>/public/app`.
- `server.js` and project server class files are created once and preserved if already present.

## Recommendation

Prefer running only the needed options for the layer you are updating.
