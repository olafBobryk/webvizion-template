# Skill inventory

`plugins/averlo/skills/` is the published Averlo plugin surface. Keep it small:
only active, default workflows belong there.

Its active surface is `compose`, `visual-parity`, `static-composition`,
`motion-composition`, `repository-workflows`, `storybook-backport`,
`create-project`, `publish-project`, `contact-form`, and
`figma-storybook-export`.

## Legacy imports

[`legacy/`](legacy/) preserves retired skills in this template repository without
publishing or auto-discovering them. Use one only when an existing project
explicitly depends on its former contract; prefer the active plugin workflow for
new work.

| Legacy skill | Active replacement | Import only when |
| --- | --- | --- |
| `design-system` | `$averlo:repository-workflows` | A project instruction or established process explicitly requires its owner-evidence command. |
| `design-system-parity-port` | `$averlo:visual-parity` + `$averlo:static-composition` | A project explicitly needs its legacy frozen-renderer, bridge-gate port procedure. |
| `entities` | `$averlo:repository-workflows` → Entities | A project still uses its broader legacy entity-contract process. |
| `skeletons` | `$averlo:repository-workflows` → Loading | The project explicitly relies on its loading-state migration guidance. |
| `surfaces` | `$averlo:repository-workflows` → Route surfaces | The project explicitly relies on its legacy route-registry procedure. |

Install a specific archived skill into Codex, pinned to the template revision
being used by the project:

```sh
python3 /Users/olafbobryk/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo olafBobryk/averlo-next-template \
  --ref <template-commit> \
  --path docs/skills/legacy/<skill-name>
```

For a local template checkout, point an agent directly at
`docs/skills/legacy/<skill-name>/SKILL.md` instead. Archived skills remain
unchanged historical contracts; do not add new behavior there. Move a workflow
back to `plugins/averlo/skills/` only after it is again a supported default.

The installer registers a manually imported legacy skill by its own name (for
example, `$design-system`), not the plugin-qualified `$averlo:design-system`.
