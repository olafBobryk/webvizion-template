# Overlays and Confirmation

Use the specialized overlay owner before consuming low-level portal behavior.

| Interaction | Owner class |
| --- | --- |
| Confirm-before-action | Confirmation modal |
| Image enlargement or inspection | Image inspection system |
| Focused blocking content or form | Modal system |
| Triggered actions | Dropdown menu |
| Anchored selection | Dropdown listbox or complete select input |
| Independently controlled anchored content | Dropdown panel |
| Transient action feedback | Toast system |

- Shared hosts own stacking, portals, focus entry and return, dismissal, and
  scroll locking. Do not create page-local host stacks.
- A modal owns focused blocking work; a dropdown owns anchored non-blocking
  work; a toast owns transient feedback.
- Mutable modals lock Escape, backdrop, and close actions while submitting.
- Standard destructive flows change confirmation options rather than creating a
  second confirmation system.

Exact compounds, options, and interaction guarantees live on the relevant
Storybook owner.
