---
name: create-project
description: Create a new independent Averlo project with the public create-averlo npm initializer, choose an explicit profile and content mode, and verify the generated documentation, dependency state, and remote-free Git repository. Use when starting, bootstrapping, or initializing an Averlo-derived application instead of cloning or copying the template repository.
---

# Create Project

Create the intended project directly from the published positive-assembly initializer. Do not clone the template, copy an existing instance, choose another repository, or scan for assembly surfaces.

## Collect the contract

Obtain these values before running anything:

- Destination directory with a lowercase npm-compatible basename.
- Profile: `full`, `app-only`, `marketing-only`, or `thin-start`.
- Content: `static` or `payload-ready`.
- Whether dependency installation should be skipped. Default to installing.

Use these supported combinations:

| Profile | Supported content | Default when the user has no preference |
| --- | --- | --- |
| `full` | `static`, `payload-ready` | `payload-ready` |
| `app-only` | `static` | `static` |
| `marketing-only` | `static`, `payload-ready` | `payload-ready` |
| `thin-start` | `static`, `payload-ready` | `payload-ready` |

Require Node.js 20.9 or newer, Git with `git init -b`, a configured Git author, and an absent destination. Do not offer `--force`.

## Initialize

Run the public command from the directory that should contain the new project:

```sh
npx --yes create-averlo <project-directory> \
  --profile <profile> \
  --content <content>
```

Append `--no-install` only when the user explicitly requests a lockfile-only project. Never add a remote or create a GitHub/GitLab project in this workflow.

## Verify

Treat the command's success output as a lead, then verify the generated project directly:

1. Read `package.json` and require its name to equal the destination basename.
2. Read `.template-profile.json` and require schema 2 plus the selected profile and content.
3. Require `docs/README.md`, `docs/project/README.md`, `docs/project/source/README.md`, and inherited `docs/guides/`.
4. Require `package-lock.json`. Require `node_modules` for the default path and its absence for `--no-install`.
5. Require branch `main`, one initial commit, a clean status, and no remotes.

If any check fails, report the exact mismatch and do not repair it by copying template files or attaching a remote.

## Handoff

Report the absolute project path, profile, content, pinned template commit from the receipt/output, installation state, Git state, and:

```sh
cd <absolute-project-path>
npm run dev
```

For a lockfile-only project, put `npm install` before `npm run dev`. Use `$averlo-next:publish-project` only as a separate, explicitly requested external publishing workflow.
