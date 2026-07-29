# Template Intelligence

Template Intelligence is an internal authoring surface for maintainers and
agents working inside this template. It generates a local map of repo concepts
and renders it at `/internal/intelligence` during development. Internal routes
remain unavailable in production.

The feature is template-owned infrastructure. Profiles include it explicitly
through positive surface ownership; generated projects contain only the
intelligence files selected by their profile.

## Generated Index

Generate the local index with:

```bash
npm run intelligence:generate
```

The index is written to:

```text
.template-intelligence/index.json
.template-intelligence/agent-map.json
```

That directory is ignored by Git. The generated index is tied to the checkout
that produced it and should not be committed.

The generator is deterministic and local-only. It scans known template source
areas such as `AGENTS.md`, `README.md`, `docs`, `src/components`, `src/lib`,
internal marketing surfaces, route config, assembly tooling, and guarded
Payload scaffold boundaries. It excludes dependency folders, build output, worktrees,
generated TypeScript configs, environment files, `.understand-anything`, and
other local artifacts.

The index is refreshed before development and build scripts through package
lifecycle hooks.

## Maintainer overview

The `/internal/intelligence` page reads the generated index server-side and
shows the maintainer summary, index statistics, and benchmark tools. Detailed
lookup remains available through the local `intelligence:query` command instead
of shipping an interactive graph renderer in the template.

## Codex turn recording

Trusted Codex sessions automatically record privacy-safe lifecycle and local
tool metadata through `.codex/hooks.json`. The hook writes an ignored,
owner-readable event log without requiring a worker command:

```text
.template-intelligence/codex-turn-events.jsonl
```

The recorder stores session and turn identifiers, timestamps, model and
permission mode, normalized tool categories, derived intelligence signals,
relative edited paths, and subagent identifiers. It never stores prompt text,
commands, tool responses, transcripts, assistant messages, environment values,
or absolute paths. Open or partial turns remain visible when Codex stops before
a normal `Stop` event.

Codex requires review and trust for the exact repository hook definition. Use
`/hooks` when a new or changed hook is awaiting review. Once trusted, normal
sessions record automatically. See the official [Codex Hooks
guide](https://learn.chatgpt.com/docs/hooks).

Use Template Intelligence directly for normal agent orientation:

```bash
npm run intelligence:generate
npm run intelligence:query -- route-architecture
```

Run an intentional `TemplateSerena` workload only when a warm Serena service is
available or when the command explicitly warms it. The surrounding Codex turn
records this activity automatically:

```bash
npm run intelligence:serena:ensure
npm run intelligence:hybrid -- \
  --task-id T1 \
  --task-name "Route architecture" \
  --topics route-architecture,dev-server \
  --serena-file src/config/routes.ts \
  --serena-symbol appRoutes \
  --require-serena
```

For one-command benchmark setup, use `--ensure-serena`:

```bash
npm run intelligence:hybrid -- \
  --task-id T1 \
  --task-name "Route architecture" \
  --topics route-architecture,dev-server \
  --serena-file src/config/routes.ts \
  --serena-symbol appRoutes \
  --ensure-serena \
  --require-serena
```

Without a warm Serena service, `npm run intelligence:hybrid` still generates and
queries Template Intelligence and exits cleanly unless `--require-serena` is
passed.

If local port discovery needs inspection, run:

```bash
npm run intelligence:serena:debug
```

The debug command checks `uv`, `serena`, and the default
`127.0.0.1:9121-9170` bind range. `EPERM` across the range usually means the
current shell sandbox cannot bind loopback ports. It is different from
`EADDRINUSE`, which means the ports are occupied. You can narrow the check with:

```bash
npm run intelligence:serena:debug -- --serena-port 9121
npm run intelligence:serena:debug -- --port-range-start 9200 --port-range-count 20
```

The optional `npm run intelligence:benchmark` and lower-level
`npm run intelligence:record` commands remain maintainer utilities. They write
an explicit standalone record only when `--output` is supplied; otherwise their
default data remains ignored and never modifies curated history.

The tracked benchmark log contains 34 recovered legacy observations with source
provenance:

```text
src/lib/template-intelligence/fixtures/template-intelligence-benchmark-runs.jsonl
```

Those historical self-reports are preserved for review but never mixed with
automatic turn telemetry or used for strategy rankings. Placeholder visual QA
rows remain in the separate example file.

The benchmark view is available at:

```text
/internal/intelligence?view=benchmarks
```

Use `example=on` for placeholder visual QA data. Placeholder data is never
treated as automatic activity or benchmark history.

### Dashboard domain coverage

Full-start recordings classify relative edited paths against the canonical
dashboard surface registry. The registry owns the active Dashboard core,
Product, Account, Organization, Platform, and Reference areas together with
their route and optional non-route source ownership. The recording view derives
its area inventory, per-turn chips, and aggregate touched counts at render time;
the hook event schema does not store a second domain model.

Omitting a dashboard child surface excludes its registry entries, so areas with
no remaining canonical surfaces disappear automatically. Profiles without the
dashboard keep Codex turn recording but omit dashboard-domain reporting.
Historical observations and visual fixtures are never assigned dashboard areas
retroactively.

Implementation instances must update the canonical registry whenever they add,
move, or remove a dashboard destination. `npm run verify:static` includes the
dependency-free `verify:surface-contracts` gate: dashboard instances fail for
unregistered pages, stale routes, invalid domain ownership, or ambiguous source
roots, while intentionally dashboard-free profiles pass without retaining
dashboard tooling.

Like the rest of `/internal`, this page is a local developer surface. It is
available through the isolated development server and always returns 404 in a
production build.

## Understand-Anything Boundary

[Understand-Anything](https://github.com/Lum1104/Understand-Anything) is a
useful optional companion tool, but it is not a runtime or package dependency
of this template.

Do not add Understand-Anything packages to `package.json`. Do not commit
`.understand-anything` outputs. If a maintainer installs it locally, treat its
generated graph as dev-local context in the same category as `.next-preview-*`
or `.template-intelligence`.

Future work can add an adapter that reads Understand-Anything output when
present, but the first pilot intentionally uses the deterministic local scanner
so clones stay clean and dependency-free.

## Serena Boundary

Serena is useful as a local semantic-code companion after the task map narrows
the starting file set. It is warm-optional: ordinary agent work must not fail
just because Serena is cold or unavailable.

```bash
npm run intelligence:serena:status
npm run intelligence:serena:setup -- --dry-run
npm run intelligence:serena:ensure
npm run intelligence:serena:stop
```

The wrapper prepends `$HOME/.local/bin` for the command, installs
`serena-agent` through `uv tool install serena-agent` only from
`intelligence:serena:ensure`, indexes the current checkout, health-checks it,
starts or reuses a local project server, and writes ignored state to:

```text
.codex/serena.json
```

The state schema is:

```json
{
  "schemaVersion": 1,
  "root": "/absolute/checkout/path",
  "projectName": "averlo-next-template-<rootHash>",
  "port": 9121,
  "pid": 12345,
  "startedAt": "2026-07-04T00:00:00.000Z",
  "logPath": "/absolute/checkout/path/.codex/tmp/serena-..."
}
```

Project names include a hash of the real checkout path, so the canonical
checkout, worktrees, and sibling repos do not collide in Serena's project
registry. Server logs live under `.codex/tmp/`.

`npm run intelligence:serena:status` reports `missing-tools`, `not-started`,
`running`, `stale-root`, or `dead-pid` without failing normal agent work.
`npm run intelligence:serena:stop` stops the stored process for this checkout
and removes `.codex/serena.json`.

When a warm server is running, direct project-server calls should use the
stored `projectName` with Serena's current endpoint shape:

```http
POST /query_project
{"project_name":"averlo-next-template-<rootHash>","tool_name":"get_symbols_overview","tool_params_json":"{\"relative_path\":\"src/config/routes.ts\"}"}
```
