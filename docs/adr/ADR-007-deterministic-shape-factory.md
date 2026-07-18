# ADR-007: Deterministic shape puzzles with watchdog-owned processing

## Status

Accepted

## Context

The Magic Shape Factory must generate solvable curriculum activities, accept forgiving pointer
input, animate a multi-step machine sequence, and recover when a visual completion callback never
arrives. Educational correctness cannot depend on the conveyor's rendered position or a Three.js
object name. Interim generated speech must also remain local and exactly match the visible task.

## Decision

Shape, size, color, item, target, and distractor data live in a versioned serializable definition.
A seeded generator creates one exact solution and validates uniqueness with a bounded retry policy.
The room reducer owns conveyor pause, mismatch/hint escalation, processing, output, celebration, and
recovery. Rendering consumes that state but never validates a puzzle or advances authoritative state
from animation callbacks.

Processing and output use lifecycle-owned watchdog deadlines as their normal completion signal.
Repeated completion events are idempotently ignored, and explicit recovery returns to a stable
waiting state. Pointer capture tracks drag movement; a DOM opening larger than the visible artwork
performs forgiving hit testing, while tap remains an accessible equivalent.

The introductory curriculum target remains a small red square while interim Ava speech is in use.
The full vocabulary remains generator-tested, but a new child-facing target requires a matching
reviewed local prompt before it is enabled.

## Consequences

Puzzles and machine transitions can be property-tested without WebGL, reproduced from a seed, and
recovered without deadlock. Rendering can change without altering curriculum behavior. The fixed
introductory target limits current variety, intentionally favoring accurate local instruction over
runtime TTS or a generic spoken prompt.

## Alternatives Considered

- Validating by the mesh at the machine opening was rejected because rendering is not authoritative.
- Advancing only from animation completion callbacks was rejected because interrupted animation can
  deadlock the room.
- Runtime TTS or remote audio was rejected because production must be offline-capable and static.
- Enabling every generated target with generic speech was rejected because a pre-reading child needs
  the spoken instruction to agree with the visual learning target.
