# ADR-009: Persisted parent settings and scoped local-data controls

## Status

Accepted

## Context

Parents need accessible controls for sound, comfort, available content, local progress visibility,
and deletion. Settings must affect every lazy room without coupling persistence to room components.
The parent gate is only an accidental-access deterrent, while reset actions need materially stronger
confirmation. Storage failure must not make the child-facing game unusable.

## Decision

A root `SettingsProvider` owns the validated persisted settings snapshot and applies updates
optimistically before writing the complete settings subsection to IndexedDB. Rooms consume settings
through hooks; shared audio applies master, music, and speech multipliers, while motion/effects,
contrast, hint timing, room availability, and learning categories flow through React composition.

Opening the grown-up area requires a cancellable 1.8-second pointer or keyboard hold once per
application session. The gate explicitly says it is not security. The parent area uses native form
controls, restores focus on close, presents only neutral local summaries, and labels the summary as
non-diagnostic.

Learning progress, saved creatures, settings, and all local data have separate operations. Each
operation first changes into a confirmation prompt; Cancel preserves the data. Full deletion clears
both root and legacy IndexedDB stores before restoring safe default settings.

## Consequences

Settings persist and apply immediately across lazy room boundaries. Invalid fields recover
independently, and failed storage leaves in-memory controls usable. At least one usable
room/category intersection is always retained, avoiding a child-facing dead end. The provider is a
global UI dependency, but curriculum and persistence formats remain independent of React rooms.

## Alternatives Considered

- A numeric PIN was rejected because the gate is not security and must not imply protection it
  cannot provide locally.
- Room-owned settings were rejected because they duplicate persistence and diverge across lazy
  modules.
- Delaying visual updates until IndexedDB completes was rejected because controls felt broken and
  storage latency should not block accessibility changes.
- One undifferentiated reset was rejected because parents need predictable, scoped deletion.
