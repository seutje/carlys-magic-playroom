# ADR-001: Static application and internal navigation foundation

## Status

Accepted

## Context

The game must run from GitHub Pages under a repository subpath, remain usable without a server, and eventually lazy-load independently recoverable rooms.

## Decision

Use Vite with a configurable normalized `base`, resolve public assets through one typed helper, and keep child-facing navigation in serializable application state. Diagnostic deep links may use a URL hash later, but no route will require a history fallback. Build metadata is compiled into the static bundle.

## Consequences

The same source can build for `/` or `/carlys-magic-playroom/`. Runtime code cannot depend on server routes. All new asset references must use `assetUrl`, CSS imports, or module imports so subpath builds stay valid.

## Alternatives Considered

- Browser history routing was rejected because GitHub Pages cannot provide a reliable application fallback.
- A hardcoded repository base was rejected because it would make root-hosted development and forks awkward.
- Runtime configuration fetching was rejected because it adds a startup failure point without solving a version 1 requirement.
