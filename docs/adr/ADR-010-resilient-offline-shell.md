# ADR-010: Resilient versioned offline shell

## Status

Accepted

## Context

The static application must work below a repository subpath and remain usable offline after a successful first load. Offline enhancement cannot become a startup dependency, cache failed responses, interrupt an active activity during an update, or rely on a remote runtime.

## Decision

A small Vite build plugin emits the base-aware web manifest and a versioned service worker from the exact hashed bundle plus local audio and icon inventory. Installation fetches entries independently and stores only successful responses, allowing partial cache failure without rejecting the whole install. Same-origin Vite assets ignore `Vary: Origin` during cache matching because their content hashes are authoritative.

Navigations use network-first with the cached entry shell as fallback. Hashed assets use cache-first with successful runtime fill. Updates do not call `skipWaiting`; the new worker waits until the existing page lifecycle ends, then activation removes older playroom cache versions. Registration happens after React renders, catches failure, and records only a bounded local diagnostic.

## Consequences

All five lazy rooms and local audio can open without a network after activation. A missing optional asset receives a non-cacheable 503 and existing visual/audio recovery remains in control. The generated worker is inspectable and has no runtime dependency, but its strategy must be maintained alongside Vite output behavior.

## Alternatives Considered

- A PWA framework dependency was unnecessary for the small static strategy and would expand build complexity.
- `cache.addAll` was rejected because one failed optional response would reject installation.
- Immediate `skipWaiting` activation was rejected because it can mix versions during an active activity.
- Network-first for hashed chunks was rejected because it delays predictable offline assets.
