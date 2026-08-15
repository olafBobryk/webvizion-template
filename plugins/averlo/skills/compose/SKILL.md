---
name: compose
description: Orchestrate static composition and motion composition for a focused section, page, shell, or site in a generated Averlo instance. Use when a surface must be built or ported and then animated as one reviewed lifecycle; do not use for canonical-template work or isolated component changes.
---

# Averlo · Compose

Coordinate one composition lifecycle without duplicating the underlying visual
parity, static, or motion rules.

1. Require a schema-v2 `.template-profile.json` receipt and create the shared
   focus packet with `section`, `page`, `shell`, or `site` as the focus hint.
   Record any automatic effective-scope expansion.
2. Invoke `$averlo:static-composition`, which frames `$averlo:visual-parity`
   evidence, verifies the completed static endpoint with that same packet, and
   records the result.
3. Pause for human approval after the static receipt by default. Continue only
   after approval, or when the caller explicitly sets `reviewBeforeMotion` to
   `false` and records the bypass in the packet.
4. Invoke `$averlo:motion-composition` with the same evidence and approval
   receipt. It must not establish a competing static baseline.
5. Report the focus/effective scope, static parity or system-fit claim, approval
   disposition, motion thesis, endpoint evidence, responsive findings, and any
   new Storybook candidate.
