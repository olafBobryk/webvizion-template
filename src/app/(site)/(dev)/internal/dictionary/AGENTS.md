# Dictionary usage

The dictionary is a reference and source-material area, not the canonical live
app.

## Purpose
Use dictionary entries to:
- inspect reusable patterns
- copy source into live template or client files
- adapt interactions, composition, and layout

## Rules
- The live template design system is source of truth unless explicitly told otherwise.
- Do not copy styling blindly from dictionary entries.
- Prefer adapting pattern structure and interaction logic first.
- Preserve current primitive APIs unless the task explicitly allows changing them.
- If a dictionary entry includes `_source/`, treat that as the copyable implementation source.
- If a dictionary entry includes `manifest.ts`, use its adaptation points before changing the destination.

## When editing live template code
Always identify:
1. destination file
2. relevant dictionary entry
3. what to preserve
4. what to adapt
