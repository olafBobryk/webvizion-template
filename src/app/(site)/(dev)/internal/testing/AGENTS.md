# Testing workbench

`/internal/testing` is an instance-local, development-only workbench for rapid
task validation in the real application shell.

- Create one temporary child route per focused change at
  `/internal/testing/<kebab-case-change>/`.
- Use `InternalPage` and existing owners; do not add product navigation,
  catalogue contracts, shared APIs, or generic component demonstrations here.
- Keep data local, explicit, and non-persistent. Delete the child route once
  the accepted implementation no longer needs it.
- The proxy owns the production 404. Do not make a testing route reachable in
  production or add it to product content.
