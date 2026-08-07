# Scroll Benchmark Hardening Port Note

## Source and boundary

- Source behavior: the 186 Capital homepage scroll research exposed a false
  positive where fewer severe-jank frames kept a candidate despite worse p95.
- Generic lifecycle owner: `/autoresearch:benchmark` in the autoresearch plugin.
- Template owner: the page-target evaluator and disposable scroll worktree under
  `scripts/scroll-performance`.

## Decisions

| Item | Decision | Template treatment |
| --- | --- | --- |
| Generic benchmark runner and Python timeout wrapper | Skip | Remain plugin-owned; do not duplicate them in a Next.js starter. |
| Primary-metric authority | Adapt | Median p95 is the sole keep metric. |
| Paired evidence and confirmation | Adapt | Rebuild and measure control/candidate twice with fresh browser/runtime sessions. |
| Geometry, severe jank, and visible parity | Adapt | Built-in guards plus project-declared npm guard scripts. |
| Environment and raw evidence | Adapt | Record fingerprints and both paired sample sets in ignored runtime JSONL. |
| Terminal reporting | Adapt | Generate the report from validated state; remove it for nonterminal state. |

## Verification packet

- Replay baseline `9.267`, provisional candidate `8.7`, and confirmation `10.1`;
  the candidate must be invalidated.
- Severe-jank improvement must never rescue a p95 regression.
- Unequal sample counts, geometry drift, named guard failure, and environment
  mismatch must reject or block.
- Run the scroll unit suite, typecheck, production build, and dry-run setup
  command before shipping.
