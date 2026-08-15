# Folder: `src/components/ui/misc/accordion`

## Ownership

Component-owned implementation for the public `Accordion` composition.

## Public boundary

- `Accordion.tsx` is the server-safe public owner inside this folder.
- `AccordionClient.tsx` and `Accordion.shared.ts` are private implementation
  modules and use direct sibling imports.

## Structural Invariants

- Preserve the server-safe public entry and skeleton boundary; do not make the
  entire public owner client-only.
- Compact and Card disclosure implementations remain under the `Accordion`
  namespace.
- Live and skeleton variants preserve matching outer geometry and the shared
  Card, Button, Text, icon, focus, and motion dependencies.
- A custom `renderTrigger` attaches disclosure props only to the actual
  disclosure button, never sibling interactive elements.
