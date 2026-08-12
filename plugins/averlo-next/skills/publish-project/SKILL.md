---
name: publish-project
description: Publish a verified local Averlo project to configured private GitLab ownership and a configured Vercel production team, with explicit target confirmation, collision checks, Git/Vercel verification, and safe partial-failure reporting. Use only when the user explicitly asks to create the remote repository, connect Vercel, deploy production, or make an initialized Averlo project live.
---

# Publish Project

Publish an already-initialized Averlo project. Keep organization-specific defaults in the owner-only local configuration, never in public source or inferred from another project.

## Resolve and confirm targets

Run the bundled preflight from this skill directory:

```sh
node scripts/publish-project.mjs preflight --project <project-root>
```

It reads `~/.config/averlo/publish-project.json`, validates the local project, and prints only non-secret targets. Stop if the file is missing or invalid. Never fall back to a personal namespace, GitHub, or another Vercel team.

Before creating anything, show and obtain action-time confirmation for all six values:

- GitLab host and namespace.
- Private visibility.
- Repository name.
- Vercel team.
- Vercel project name.
- Production deployment target.

Treat name collisions or a changed target as a new decision. Do not auto-suffix or infer an alternative.

Before the confirmation, check both targets without creating them:

```sh
glab repo view <namespace>/<project-name>
vercel project inspect <project-name> --scope <team>
```

An existing GitLab or Vercel project is a collision even if the other target is absent. Stop and ask for direction; do not attach, replace, transfer, or rename it automatically.

## Establish authenticated tooling

1. Require `glab` and `vercel`. On macOS, install a missing GitLab CLI with `brew install glab`; otherwise use GitLab's documented package for the host system.
2. Authenticate GitLab with browser OAuth and keyring storage:

   ```sh
   glab auth login --hostname <gitlab-host> --web --git-protocol <protocol> --use-keyring
   ```

3. Verify the configured namespace is accessible with `glab api` before creating a project.
4. Verify the configured Vercel team appears in `vercel teams ls`.

Never request a token in chat, print credential files, or create a long-lived deployment token.

## Create the private GitLab remote

Require a clean schema-2 Averlo project on `main`, with no remotes and no `.vercel` link. Re-run preflight immediately before the first external write.

1. Check whether `<namespace>/<project-name>` already exists. Stop on a collision.
2. Create exactly that private project with default branch `main`:

   ```sh
   glab repo create <namespace>/<project-name> --private \
     --defaultBranch main --skipGitInit
   ```

3. Add the configured remote URL as the configured remote name.
4. Push `main` with upstream tracking.
5. Verify the remote URL, upstream branch, remote project visibility, and pushed SHA.

Do not add a license, README, template history, or secondary provider remote.

## Link and deploy Vercel

Use the configured team and project name on every command:

```sh
vercel project add <project-name> --scope <team>
vercel link --yes --team <team> --project <project-name> --cwd <project-root>
vercel git connect <gitlab-repository-url> --scope <team> --cwd <project-root>
vercel deploy --prod --yes --scope <team> --cwd <project-root>
```

Stop if GitLab integration is unavailable or the Vercel project already belongs to a different repository/team. Do not deploy through an unconnected substitute project.

Verify the resulting production deployment is ready, the Git connection targets the configured GitLab project, and deployment Git metadata matches the pushed commit when available. Verify the production URL responds successfully and return that direct URL.

## Secrets, hooks, and failure handling

- Do not add custom domains, activate Payload-powered infrastructure, or create deploy hooks in this workflow.
- If existing staging and production deploy hooks are deliberately supplied or discovered, follow the generated repository's WhatsApp deploy-bot registration policy without displaying or storing hook URLs.
- On any partial failure, preserve GitLab/Vercel resources already created. Report their safe dashboard URLs and exact state; never delete, rename, transfer, or retry against another account automatically.
- Finish by requiring a clean local repository, the configured upstream, the expected Vercel link, and a ready production deployment.
