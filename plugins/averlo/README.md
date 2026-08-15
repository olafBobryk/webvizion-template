# Averlo Codex plugin

## Primary implementation router

Use `$averlo:repository-workflows` as the primary router for implementation and
implementation review inside Averlo repositories. Governing repository
instructions may require this explicit-only skill without enabling global
implicit invocation.

After it selects the applicable workflows and concern contracts, do not invoke
the overlapping design-system, skeleton, entity, or surface skills again for
the same change unit. Those skills remain unchanged compatibility entry points
for projects that invoke them directly. Dedicated project-lifecycle and transfer
skills keep their separate operational boundaries.

## Authored source

`plugins/averlo/` is the sole authored source for this plugin. The local
marketplace declaration in `.agents/plugins/marketplace.json` resolves directly
to this directory.

Installed plugin copies, cache entries, and temporary marketplace material are
installation artifacts. Do not edit or synchronize them. Make every change to
plugin metadata, skills, agents, references, scripts, and tests in this
directory, then reinstall or republish the plugin when a consumer needs the
updated version.

The sensitive contact-form workflow belongs exclusively in this plugin as
`$averlo:contact-form`; do not maintain a standalone global copy.
