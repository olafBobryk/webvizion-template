# Marketing architecture

## Contract

Keep marketing components source-neutral. New source-backed multi-section
pages live in the installed marketing route family, own a registered marketing
surface identity, resolve a `MarketingPageDocument`, and delegate its layout to
the registered section renderer. They do not import or compose registered
section implementations directly. Existing explicit utility or document
routes may retain their narrower owners; they are not precedent for bypassing
the document architecture in a new composed page.

Give every blockType one named renderer. Allow any number of organizational
folders, but end the path with
sections/**/<blockType>/<PascalBlockType>Section.tsx. Make the leaf folder and
renderer describe content structure rather than a product or brand. Use
intermediate folders such as heroes or articles only to classify section
families. Colocate supporting components under the leaf owner, but reserve the
Section suffix for the registered renderer.

Use Tailwind classes for marketing-section layout and presentation. Do not put a
section's styles in page-level or global CSS. Add a colocated CSS module only
for a documented selector or keyframe requirement that Tailwind cannot express.

Keep public shell visuals in the shared SiteShell. Let marketing adapters supply
resolved site-layout content while shared layout owners retain header, menu,
footer, shell order, responsive behavior, and scroll lifecycle. Source desktop
and compact navigation/search from the same layout data.

Keep stable shared boundaries around the header, content, footer, and the
content-plus-footer composition frame. A composition review may exclude an
existing approved header without removing it from the production page; the
review state and capture boundary belong to SiteShell/Preview infrastructure,
never route CSS. Continue to implement an evidenced footer through the shared
footer owner instead of reproducing it inside page content.

Use the exclusive surfaceId-or-href contract for navigation and calls to
action. Registered destinations use installed marketing or auth surface IDs;
external URLs, fragments, and generated internal links use the appropriate
direct link boundary.

## Hard boundaries

- Do not use product or brand names in section leaf folders, registered renderer
  names, or generic canonical owners.
- Do not create a public marketing page at an unowned App Router path or use a
  route-local page to evade document and renderer registration.
- Do not flatten all sections into one route file or one global stylesheet.
- Do not make the frontend section model a generic page builder.
- Do not import Payload document shapes or source-specific metadata into
  marketing renderers.
- Do not create route-specific copies of shared shell, header, menu, footer, or
  scroll behavior.
- Do not hide shared shell regions with route-local styles or use a source frame
  as implicit authorization to replace an approved header.
- Do not add localization, language switching, or brand-specific CTA contracts
  to the shared shell without an explicit optional slot.

## Repository context

Read only the marketing boundary being changed:

- `src/lib/marketing-content/AGENTS.md` for section topology, source neutrality,
  linking, and content-source behavior.
- `src/app/(site)/(marketing)/_components/AGENTS.md` for shell adaptation.
- `src/app/(site)/_components/layout` for the shared shell contract.
- The selected blockType, renderer, fallback content, registry, resolver, and
  nearest AGENTS.md.

## Verification

- Run npm run verify:route-surfaces and npm run verify:marketing-sections after
  adding or moving a public marketing page. Run npm run
  verify:marketing-sections after adding, moving, renaming, or removing a
  registered section.
- Run npm run verify:site-layout for shared shell or public navigation changes.
- Verify route pages delegate layout, names remain product-neutral, intermediate
  folders preserve the leaf convention, and section styling remains Tailwind
  first.
- For material UI changes, use the managed preview and report the direct
  section-anchor URL when it exists.
