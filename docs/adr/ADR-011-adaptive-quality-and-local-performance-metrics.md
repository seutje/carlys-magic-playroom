# ADR-011: Session quality profiles and local performance metrics

## Status

Accepted

## Context

The same educational rules must remain stable across capable computers and lower-power tablets. Rendering load needs coarse adaptation and measurable budgets without remote telemetry, persistent fingerprint-like device data, or per-frame React/store updates.

## Decision

One root provider selects low, medium, or high quality for the application session from coarse memory, CPU, DPR, and viewport signals. Profiles control canvas DPR, antialiasing, shadows, decorative objects/motion, and a bounded effect count. Only the diagnostics query can override quality, and the override is not persisted. Activity generators, reducers, state, and validation remain unchanged.

Each canvas uses an imperative probe that aggregates 30 frames before recording one bounded in-memory sample. Diagnostics retain six scene summaries and 20 room-load samples, plus draw calls and optional browser heap data. The data is exposed only in the existing diagnostics panel and can be reset locally.

The production build emits and enforces a JSON budget report for initial assets, room chunks, audio, duplicates, major assets, and the documented shared 3D runtime exception.

## Consequences

Low mode materially reduces pixel and decorative work while keeping essential feedback. Metrics are cheap, local, bounded, and testable without identifying a child or device. A physical target-device pass remains necessary because headless frame timing cannot prove real GPU and thermal behavior.

## Alternatives Considered

- Persisting automatic quality was rejected because capability can change and the value is not a parent preference.
- Dynamic curriculum simplification was rejected because rendering quality must not change correctness.
- Remote telemetry was rejected for privacy and because local diagnostics are sufficient for development.
- Updating React state every frame was rejected because it would create the performance problem being measured.
