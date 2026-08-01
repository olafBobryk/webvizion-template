# Folder: `src/components/ui/misc/accordion`

## Ownership

Component-owned implementation for the public `Accordion` composition.
Storybook `UI/Misc/Accordion` owns its consumer contract and executable behavior.

## Public Boundary

- External consumers import `Accordion` and its public types from
  `@/components/ui/misc`.
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
- A custom `renderTrigger` attaches every supplied disclosure prop to the actual
  disclosure button; sibling interactive elements do not receive those props.
