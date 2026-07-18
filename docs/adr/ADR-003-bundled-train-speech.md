# ADR-003: Bundled train speech

## Status

Accepted

## Context

The Tiny Delivery Train needs consistent spoken instructions, counts, and success feedback. Runtime browser speech varies by device, is difficult to coordinate, and is not reliably available offline. Human recordings are not yet available, and the maintainer approved high-quality neural TTS as an interim source.

## Decision

Generate the five lines at build time with the soft `en-US-AvaNeural` voice and deliver each as local OGG Vorbis and MP3 assets. The runtime selects a supported format using base-aware URLs and never calls a speech service.

A train speech controller owns one active clip and a serialized queue. Replay interrupts the queue, counts retain child-action order, mute is checked immediately before playback, and room disposal stops active audio. Cue names are stable so human recordings can replace the generated files without code changes.

## Consequences

The activity has consistent, offline-capable speech now, with under 110 kB of audio across both formats. The generated voice remains an interim creative asset that may be replaced after human review. Speech playback is deliberately supportive: an audio failure does not block visual gameplay.

## Alternatives Considered

- Browser text-to-speech was rejected because voices and timing vary and offline availability is unreliable.
- A remote runtime TTS service was rejected because it violates static, private, offline operation.
- Waiting for human recordings was rejected after the maintainer explicitly approved generated interim files.
