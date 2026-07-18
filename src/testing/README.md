# Shared deterministic test helpers

`helpers.ts` provides small test-only adapters for seeded fixtures, reducer event sequences, complete room lifecycles, controlled audio, in-memory persistence, deterministic timers/animation time, and pointer paths.

Keep helpers domain-neutral. Room-specific expected behavior remains in that room's tests. Visual tests disable browser animation and use fixed activity seeds; animation adapters can use `DeterministicClock` when frame-time behavior itself needs an assertion.
