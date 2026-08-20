---
name: compose
description: Orchestrate static composition and motion composition for a focused section, page, shell, or site in a generated Averlo instance. Use when a surface must be built or ported and then animated as one reviewed lifecycle; do not use for canonical-template work or isolated component changes.
---

# Averlo · Compose

Coordinate one composition lifecycle without duplicating the underlying visual
parity, static, or motion rules.

1. Require a schema-v2 `.template-profile.json` receipt and create the shared
   focus packet with `section`, `page`, `shell`, or `site` as the focus hint.
   Record any automatic effective-scope expansion and the stable
   `docs/composition/<focus-slug>.md` path.
2. Invoke `$averlo:static-composition` once for the complete requested focus in
   `end-to-end` delivery. Compose must not stop at a staged realization handoff
   because motion requires the integrated, exact static endpoint.
   It owns the composition record, one runtime goal, and the skill-defined
   terminal condition; Compose must not create a competing record or goal,
   interpret measurements, restate completion policy, or add child goals. For
   page and site work, Static Composition processes the shared shell,
   source-ordered sections, full-page gates, and responsive evidence from that
   record. It frames and verifies `$averlo:visual-parity` evidence with the same
   packet.
3. Require both the current Static Composition goal and its committed
   composition record to be complete before treating the static endpoint as
   ready. A blocked goal or record is acknowledged incompletion, not a review
   checkpoint.
4. Pause for human approval after the static receipt by default. Continue only
   after approval, or when the caller explicitly sets `reviewBeforeMotion` to
   `false` and records the bypass in the packet.
5. Invoke `$averlo:motion-composition` with the same evidence and approval
   receipt. It must not establish a competing static baseline.
6. Report the composition-record path, focus/effective scope, static parity or
   system-fit claim, approval disposition, motion thesis, endpoint evidence,
   responsive findings, and any new Storybook candidate.
