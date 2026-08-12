# create-averlo

Create an independent Averlo project from a pinned template profile.

```sh
npx create-averlo my-project --profile thin-start --content static
```

The initializer fetches the exact template commit associated with its package
version, assembles the selected profile, installs dependencies, and creates a
fresh local Git repository on `main`. It never copies or assigns the template
repository remote.

## Options

```text
create-averlo <project-directory> [options]

--profile <id>      full, app-only, marketing-only, or thin-start
--content <mode>    static or payload-ready; defaults to the profile setting
--no-install        Generate the lockfile without installing dependencies
--help              Show command help
--version           Show the package version
```

Interactive terminals prompt for a missing project directory, profile, and
content choice. Agents and other non-interactive callers must provide the
directory and profile explicitly.

Generated repositories have no remote. Add one later with the normal Git or
GitHub workflow for the project that will own it.

## Publishing

The first `0.1.0` release must be published manually from a clean pushed commit
with npm 2FA. After it exists, configure npm trusted publishing for
`olafBobryk/averlo-next-template` and the workflow filename
`publish-create-averlo.yml`. Later `create-averlo-v*` GitHub releases publish
through OIDC without a long-lived npm token.
