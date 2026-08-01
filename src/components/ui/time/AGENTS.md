# Folder: `src/components/ui/time`

## Ownership

This folder owns shared relative-time and timezone-aware calendar-date
presentation. Consumer contracts live under `UI/Time/*` in Storybook.

## Dependency and runtime boundaries

- Time presentation depends on the `Text` primitive for typography and must not
  depend on feature or route code.
- `DateAgo` is a client component because it schedules relative-time refreshes;
  it must clear its interval on unmount.
- `DateIndicator` stays server-safe and resolves formatting through the shared
  application timezone boundary.

## Structural invariants

- Date parsing, relative-time thresholds, ordinal formatting, and timezone
  resolution remain centralized in these owners.
- Skeleton members continue to delegate to `Text.Skeleton`; they do not become
  separate component identities.
