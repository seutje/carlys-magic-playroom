# ADR-006: Deterministic positive-outcome garden

## Status

Accepted

## Context

Little Garden teaches cause and effect. A young child may tap quickly, use helpers in a different order, pause, or leave mid-effect. None of those actions should harm the plant, skip unpredictably, or create a punitive state.

## Decision

Represent water, light, growth, time of day, visitors, and one/two-step tasks as serializable values in a pure reducer. Seeded definitions choose task order. A correct helper advances one growth stage; another helper still increases its positive resource and returns a gentle prompt without reducing growth.

Environmental effects own a short evaluating phase. Further taps during it are ignored, which bounds rapid input deterministically. Two mismatches simplify the UI to the requested helper. Pausing is allowed only from the stable waiting phase, and room-owned timers/audio are disposed together.

Only completion totals, encountered concepts, skill counts, and bounded completion IDs persist in the root save. Transient effect, visitor, lighting, and animation state never persist.

## Consequences

The same definition and event sequence always produce the same garden. Excess water or light is clamped and positive; it cannot wilt or reset the plant. Future simulation rules must preserve monotonic safe growth and add fixed-sequence regression tests.

## Alternatives Considered

- A real-time simulation was rejected because timing and suspended tabs would make learning outcomes nondeterministic.
- Queuing every rapid tap was rejected because it could skip stages after the child stopped interacting.
- Negative overwatering or low-light outcomes were rejected as punitive and inappropriate for this activity.
