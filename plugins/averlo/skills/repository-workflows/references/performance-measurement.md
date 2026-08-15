# Performance measurement

## Contract

Treat scroll performance as implementation assessment of a real existing page,
not as a template benchmark or an excuse to change page structure without
evidence. Measure a production-like local build against the real route and
declare only the smallest mutable source scope that can affect the observed
cost.

Establish an accepted baseline before evaluating a candidate. Preserve target
path, viewport, and page geometry: a candidate that changes the measured page
shape beyond the defined gate is a visual or layout change, not a performance
win. Keep a candidate only when it improves a primary scroll metric without an
unacceptable regression in the paired metric.

Use the disposable worktree loop for measured optimization. Keep its harness,
record schema, prior baseline, and generated runtime state read-only; change
only the declared product scope. Report the target route, baseline, retained or
rejected candidate, geometry-gate result, and measured evidence.

## Hard boundaries

- Do not treat a template-assessment benchmark or historical benchmark record
  as product-performance evidence.
- Do not score a candidate from a dirty worktree or change the measurement
  harness while evaluating product code.
- Do not accept a shorter page, altered viewport, or changed scroll distance as
  a performance improvement.
- Do not create an internal route solely to make a scroll measurement easier.
- Do not load this concern for ordinary motion, responsive, or visual work that
  is not being measured.

## Repository context

Read only entries that exist and apply to the measured page:

- `docs/operations/scroll-performance.md` for commands, metric schema,
  geometry gates, and acceptance rules.
- `scripts/scroll-performance` for the measurement harness and disposable-loop
  ownership.
- `scripts/scroll-performance/fixtures/scroll-performance-runs.example.jsonl`
  for the committed record shape.
- The measured route, its real rendering owners, and their nearest `AGENTS.md`.

## Verification

- Run the documented measurement command against the real target route and
  record the aggregate result before scoring a candidate.
- For a retained candidate, run the confirm pass and verify the geometry gate,
  primary metrics, paired-metric tolerance, and declared mutable scope.
- Run the focused route, interaction, and visual checks needed to distinguish a
  true rendering improvement from an unintended layout or behavior change.
