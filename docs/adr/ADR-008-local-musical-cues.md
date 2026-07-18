# ADR-008: Local deterministic musical cues and visual equivalents

## Status

Accepted

## Context

Musical Corner must teach instrument identity, pitch, and volume with low latency, bounded overlap,
offline playback, and a meaningful muted experience. Browser runtime synthesis would vary by device,
while remote sound services would violate the static and offline architecture.

## Decision

Musical rounds are seeded, versioned definitions whose target is always one of their choices.
Difficulty one compares drum, bell, and xylophone timbres; difficulty two compares high and low bell
cues; difficulty three compares loud and soft drum cues. Each sound has a stable visual pattern and
instrument picture that remains visible while muted.

Short additive-synthesis masters are generated during development, normalized, and bundled locally
as OGG with MP3 fallback. Normal cues target -18 LUFS, while the intentional loud/soft comparison
targets -14 and -28 LUFS. The shared one-voice coordinator interrupts stale playback, resumes a
suspended audio context, and owns all room audio. A controller-level 180 ms gate and reducer
evaluation state bound rapid selection.

## Consequences

The activity is deterministic, base-path safe, offline, testable without WebGL, and playable without
sound. The small cues add less than 9 KB per encoded file. Synthesized timbres are consistent across
browsers, but their perceptual clarity still requires a human listening check on the intended tablet
speakers before Phase 7 can be marked complete.

## Alternatives Considered

- Runtime Web Audio synthesis was rejected because device differences would make curriculum output
  less reproducible.
- Remote or CDN audio was rejected because it breaks static offline behavior.
- Sound-only targets were rejected because muted and hearing-diverse play needs a visual equivalent.
- Treating frequency inspection or browser tablet emulation as a physical listening review was
  rejected because neither demonstrates real speaker clarity.
