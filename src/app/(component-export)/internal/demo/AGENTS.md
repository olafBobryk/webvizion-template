<INSTRUCTIONS>
# Component Export Surface

- `/internal/demo` is a shell-free application projection of the generated catalogue manifest. Storybook renders the same shared surface for Figma capture.
- Application code must never import Storybook, CSF, or `.stories` modules.
- Preserve generated manifest order and the fixed section mapping in `exportSections.ts`; do not add a second owner registry.
- Keep the visible hierarchy to section, group, owner label, owner description, state labels, bare component, and whitespace.
- Do not add site navigation, Card, Panel, Divider, borders, shadows, or decorative export chrome.
- Keep previews inside `PortalScope`, preserve preview ID scoping, and project only one authored axis at a time.
- Standard stages are 640px; wide and overlay stages are 1248px within a 1440px canvas with 96px side margins.
</INSTRUCTIONS>
