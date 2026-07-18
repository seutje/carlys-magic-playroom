# ADR-004: Shared activity framework after the train slice

## Status

Accepted

## Context

The Tiny Delivery Train proved the lifecycle, state, instruction, hint, pointer, audio, persistence, and testing behavior needed by later rooms. Leaving those mechanisms inside the train would cause the remaining activities to implement subtly different cleanup and recovery rules. Extracting them before a working slice existed would have made their contracts speculative.

## Decision

Adopt small shared primitives with room-specific adapters:

- Lazy room modules expose capabilities, preload, session creation, and a component. The host owns the idempotent session lifecycle through disposal.
- Activity reducers share exhaustive phases and lifecycle events while retaining typed room events.
- Owned timers provide ordinary scheduling and watchdogs; hint plans are serializable data.
- Instructions use text/audio keys and named parameters. Visual text remains authoritative when audio is missing.
- DOM and R3F dragging share pointer ownership, thresholds, target evaluation, plane projection, and snap timing.
- One audio coordinator enforces channel priority, one-voice playback, interruption, ducking, settings, context recovery, and room ownership.
- IndexedDB contains one versioned root save. Room subsections validate independently, legacy train progress migrates, and reset clears both root and legacy stores.
- Deterministic test helpers cover seeds, reducers, sessions, audio, persistence, clocks, and pointer paths.

## Consequences

Later rooms can reuse tested recovery behavior without importing train code. The train remains the regression consumer and placeholder rooms exercise the room contract. Shared abstractions intentionally stay small and typed; curriculum rules, render decisions, and room events remain local.

The database advances from version 1 to 2 while preserving the legacy progress store for migration. Audio currently uses one active voice globally, which favors clarity over polyphony and can be extended by channel policy if a later room proves the need.

## Alternatives Considered

- Copying train mechanisms into each room was rejected because cleanup and accessibility behavior would drift.
- A large state-machine or game-engine dependency was rejected because the proven needs are covered by small local primitives.
- Keeping one IndexedDB record per room without a root schema was rejected because settings, reset, migrations, and partial recovery need an application-level contract.
