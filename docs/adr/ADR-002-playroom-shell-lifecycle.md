# ADR-002: Playroom shell lifecycle and navigation

## Status

Accepted

## Context

The startup view must remain lightweight, audio must begin only after an explicit gesture, child input may repeat during transitions, and each room needs independent loading and recovery without server routing.

## Decision

Use a pure typed reducer for startup, playroom, transition, and room navigation. Initialize a custom browser-audio service from Play while allowing visual play after audio failure. Lazy-load the React Three Fiber playroom after Play and load every room through a typed dynamic-import registry. Own transition timers in the application lifecycle and expose accessible DOM controls alongside Canvas interactions.

## Consequences

Navigation correctness is testable without WebGL, duplicate and stale transition events are ignored, and the startup bundle excludes Three.js. Every room builds as a separate chunk and receives a clean mount/unmount lifecycle. Room and WebGL failures retain DOM-based Retry or Home paths.

## Alternatives Considered

- URL history routing was rejected because it adds no child-facing value and complicates static hosting.
- Loading Three.js before Play was rejected because it makes the startup tier unnecessarily heavy.
- Browser text-to-speech was rejected as a production dependency; recorded content can be added through the audio abstraction in later phases.
- A global state dependency was rejected for this narrow state graph; the pure reducer provides sufficient guarded transitions with less runtime surface.
