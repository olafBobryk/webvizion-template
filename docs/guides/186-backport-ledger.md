# 186 Backport Decision Ledger

This is a source-template decision record, not a project backlog. An item marked
**ignore** must not be proposed again unless a new, concrete template use case is
approved.

| 186 item | Decision | Reason |
| --- | --- | --- |
| Section semantic context and theme roles | Port | Shared Section metadata with template-owned `ink`, `paper`, and `primary` roles. |
| ArrowAction | Port | A compact documented composition of Button, Icon, focus, and interaction tokens. |
| Button hover-fill, extra variants, and editorial sizes | Ignore | A separate action-language redesign, not required by a reusable template consumer. |
| Editorial Text variants | Ignore | 186-specific typography naming and art direction. |
| Editorial Card treatment | Ignore | 186-specific layout and visual hierarchy. |
| BrandMark pulse | Ignore | Brand identity behavior, not a template primitive. |
| Smooth-scroll controller | Ignore | Global interaction policy with preference and nested-scroll implications. |
| Footer featured-link behavior and editorial footer | Ignore | Application/content composition; scalar replay already covers the reusable text behavior. |
| Editorial page sections | Ignore | Content and layout composition, not design-system ownership. |
| Legacy Reveal and Scroll internals | Ignore | Superseded by MotionSource and MotionEffect. |
| Generic Scroll.Scale | Ignore | No approved reusable template use case. |
| LetterWave and Rive | Ignore | Intentionally removed from the template. |
| AutoCycle, ImageSwitcher, ScrollBorders, and image inspection | Ignore | Already represented by existing template owners. |
