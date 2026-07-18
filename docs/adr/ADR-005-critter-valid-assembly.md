# ADR-005: Valid-by-construction critter assembly

## Status

Accepted

## Context

Build-a-Critter must let a young child experiment freely without precision, broken combinations, or a dead end. Creatures also need to survive reloads and future asset changes.

## Decision

Represent bodies, exhaustive socket IDs, and parts as serializable content. Each part declares its socket and compatible bodies. The pure assembly reducer accepts selections by ID, automatically snaps one part per socket, replaces existing parts, removes incompatible parts when a body changes, and locks mutations during celebration.

Rendering consumes this validated state through fallback primitives; mesh names and positions never determine correctness. The guided UI exposes the active category plus previously filled categories so replacement remains available before completion.

Completed creatures use schema version 1 inside the root save record. Loading validates every socket and isolates corrupt entries; schema 0 migrates only when the resulting creature is valid. Stable part IDs permit future artwork replacement without save changes.

## Consequences

No interaction can produce an invalid completed creature, and no alignment precision is required. New bodies or parts must declare compatibility and add validation fixtures. Changing or removing a stable part ID requires a save migration or a safe primitive fallback.

## Alternatives Considered

- Deriving attachments from Three.js hierarchy or positions was rejected because correctness must remain renderer-independent.
- Allowing arbitrary part/socket combinations was rejected because it creates malformed saves and confusing visuals.
- Saving raw scene objects was rejected because they are not stable, portable, or safely validated.
