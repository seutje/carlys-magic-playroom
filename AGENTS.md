# AGENTS.md

## Purpose

This file defines the operating rules for any coding model or automated engineering agent working in the **Carly’s Magic Playroom** repository.

The product and technical design document is the primary product specification. This file translates that specification into repository-level engineering instructions.

When this file conflicts with an implementation shortcut, existing code convention, or agent preference, this file wins unless a human maintainer explicitly says otherwise.

---

## Project Summary

Carly’s Magic Playroom is a browser-based educational 3D game for children approximately three years old.

The application:

- Is built with Vite, React, and TypeScript.
- Runs entirely in the browser.
- Has no backend, API server, serverless function, database, authentication service, or server-side rendering.
- Must deploy as static files to GitHub Pages.
- Must support a repository subpath through Vite’s `base` configuration.
- Stores progress and settings locally.
- Must remain usable after initial loading when offline support is enabled.
- Contains a central playroom and five activity rooms:
  - Tiny Delivery Train
  - Build-a-Critter Lab
  - Little Garden
  - Magic Shape Factory
  - Musical Corner

The game must be extremely simple for the child while remaining robust and sophisticated internally.

---

## Source-of-Truth Priority

When requirements conflict, apply this priority order:

1. Child safety and usability
2. No-server static deployment
3. Correctness and recovery
4. Accessibility
5. Privacy
6. Performance
7. Maintainability
8. Visual polish
9. Feature breadth

Do not compromise a higher-priority requirement to satisfy a lower-priority one.

---

## Non-Negotiable Product Rules

### Child interaction

The child-facing experience must not require:

- Reading
- Precise timing
- Fast reactions
- Double-clicking
- Right-clicking
- Multi-touch gestures
- Pinch-to-zoom
- Camera orbit controls
- Precise rotation
- Complex menus

Primary interactions should be limited to:

- Tap
- Drag
- Drop

### Failure behavior

Incorrect input is normal gameplay, not an exceptional condition.

Never respond to a child’s mistake with:

- Harsh sounds
- Red failure screens
- Lost progress
- Punitive timers
- Scolding language
- Forced restarts
- Dead ends

Use:

- Gentle redirection
- Playful object reactions
- Repeated instructions
- Visual hints
- Simplified choices
- Demonstrations
- Larger interaction targets

### Responsiveness

Every meaningful interaction should provide immediate visible or audible feedback.

Aim for feedback within approximately 100 milliseconds.

### Navigation

The child must never become trapped.

Every activity state must provide at least one of:

- A valid next action
- Automatic continuation
- Replay instruction
- Home control
- Safe restart
- Recovery action

### Privacy

Do not add:

- Remote analytics
- Advertising
- Trackers
- User accounts
- Cloud saves
- Remote speech processing
- Device fingerprinting
- Personal data collection

All learning progress and settings must remain on-device.

---

## Technical Constraints

### Runtime

Production must consist entirely of static files.

Do not introduce:

- Node.js runtime requirements
- API routes
- Express
- Serverless functions
- Edge functions
- Server-side rendering
- Runtime secrets
- Remote databases
- Authentication providers
- Required third-party APIs

Development tooling may use Node.js, but the deployed application must not.

### GitHub Pages

All production code must work beneath a non-root base path.

Never assume the application is hosted at `/`.

Use:

```ts
import.meta.env.BASE_URL
```

or an equivalent base-aware asset helper.

Do not use hardcoded asset paths such as:

```ts
"/audio/example.mp3"
"/models/train.glb"
```

Use:

```ts
`${import.meta.env.BASE_URL}audio/example.mp3`
```

or a shared typed asset resolver.

### Routing

Prefer:

- Internal application state
- Hash routing
- A single static entry point

Do not rely on server-side history fallback.

### Browser support

Target modern Chromium, Firefox, and Safari browsers, including tablet browsers.

Account for:

- Audio autoplay restrictions
- Touch and pointer events
- Visibility changes
- Orientation changes
- WebGL context loss
- Browser storage failures
- Service-worker failure
- Suspended audio contexts

---

## Preferred Technology Stack

Use the existing repository choices when present. For a new repository, prefer:

- Vite
- React
- TypeScript with strict mode
- React Three Fiber
- Three.js
- Zustand for lightweight application state
- XState or explicit typed state reducers for activity state machines
- IndexedDB through a small wrapper such as `idb`
- Vitest
- React Testing Library
- Playwright
- ESLint
- Prettier

Physics libraries such as Rapier may be used selectively.

Do not add a large dependency when a small local abstraction is sufficient.

Every new dependency must have a clear reason.

---

## Architectural Boundaries

### Required separation

Keep these layers separate:

1. Content definitions
2. Procedural activity generation
3. Serializable activity state
4. Activity rules and state transitions
5. Rendering adapters
6. React and React Three Fiber components
7. Audio playback
8. Persistence
9. Diagnostics

Core game correctness must be testable without WebGL.

### Forbidden coupling

Do not:

- Store authoritative game state only in Three.js objects.
- Use mesh names as educational identifiers.
- Make puzzle validation depend on rendered positions.
- Put business logic inside animation callbacks.
- Mutate global state during every animation frame.
- Couple audio files directly to room UI components.
- Place all rooms in one monolithic component.
- Make persistence aware of React components.
- Make rendering code generate curriculum decisions.

### Preferred data flow

Use:

```text
Seeded generator
    ↓
Serializable activity definition
    ↓
Typed activity state machine
    ↓
Render adapter
    ↓
React Three Fiber scene
```

User input should flow back as typed events.

---

## Suggested Repository Structure

Use this structure unless the repository already has a documented alternative:

```text
src/
├── app/
├── engine/
│   ├── animation/
│   ├── assets/
│   ├── audio/
│   ├── diagnostics/
│   ├── input/
│   ├── rendering/
│   └── timing/
├── playroom/
├── rooms/
│   ├── train/
│   ├── critter/
│   ├── garden/
│   ├── shapes/
│   └── music/
├── curriculum/
├── persistence/
├── state/
├── content/
├── ui/
├── testing/
└── types/
```

Tests should be organized by purpose:

```text
tests/
├── unit/
├── integration/
├── e2e/
├── visual/
└── performance/
```

---

## TypeScript Rules

### Strictness

TypeScript strict mode must remain enabled.

Do not weaken compiler settings to avoid fixing errors.

### Disallowed patterns

Avoid:

- Broad `any`
- Unsafe type assertions
- Non-null assertions without justification
- Unchecked string-based event names
- Implicitly shared mutable objects
- Unvalidated JSON parsing
- Catch blocks that silently discard errors

When external data or persisted data is loaded, validate it before use.

### Domain types

Prefer domain-specific types:

```ts
type RoomId = "train" | "critter" | "garden" | "shapes" | "music";
type ActivityPhase =
  | "loading"
  | "intro"
  | "instruction"
  | "waiting"
  | "evaluating"
  | "hint"
  | "celebrating"
  | "complete"
  | "paused"
  | "exiting"
  | "error";
```

Do not replace well-defined domain unions with arbitrary strings.

### Exhaustiveness

Use exhaustive checks for domain unions.

Example:

```ts
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}
```

---

## State Machine Rules

Every room activity must use explicit states.

At minimum, model:

- Loading
- Introduction
- Instruction
- Waiting for input
- Evaluation
- Hint
- Celebration
- Completion
- Paused
- Exiting
- Recoverable error

### Event handling

Events must be typed.

Unexpected events must:

- Be ignored safely, or
- Produce a recoverable transition

They must not corrupt state.

### Idempotency

Repeated child input is expected.

Operations such as:

- Starting an animation
- Completing a round
- Adding an object
- Playing an instruction
- Returning home

must either be idempotent or guarded against duplicate execution.

### Timers

All timers must:

- Be centrally tracked or owned by a clear lifecycle.
- Be cleared on unmount, room exit, reset, and pause where appropriate.
- Not continue changing state after disposal.

Do not scatter unmanaged `setTimeout` calls throughout components.

---

## Randomness and Procedural Content

All testable activity generation must be deterministic.

Every generator must accept a seed.

Do not use `Math.random()` directly in room logic.

Use a shared seeded random interface.

Example:

```ts
interface RandomSource {
  next(): number;
  integer(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
}
```

### Generator requirements

Generated activities must be validated before display.

Examples:

- Requested counts must be achievable.
- At least one correct answer must exist.
- Distractors must not create accidental ambiguity unless intentional.
- Object identifiers must be unique.
- Every generated definition must be serializable.
- Invalid generations must be rejected and regenerated with a bounded retry policy.

### Testing

Generators require:

- Fixed-seed tests
- Boundary tests
- Property-based tests where practical
- Reproduction fixtures for bugs

Every procedural bug fix should add the failing seed to regression tests.

---

## Rendering Rules

### React Three Fiber

Use React Three Fiber declaratively where it improves lifecycle management.

Do not force rapidly changing per-frame values through React state.

Use refs or dedicated animation systems for frame-level transforms.

### Performance

Avoid:

- Recreating geometry or materials during render
- Excessive draw calls
- Many dynamic lights
- Large transparent surfaces
- Per-frame global store updates
- Unbounded particles
- High-resolution textures without justification
- Full-world physics for decorative objects

Prefer:

- Shared geometry
- Shared materials
- Instancing
- Object pooling
- Lazy room loading
- Adaptive pixel ratio
- Baked lighting
- Simplified shadows
- Culling
- Quality levels

### Camera

The application controls the camera.

Do not require child-controlled orbit, zoom, or pan.

Camera transitions must respect reduced-motion settings.

### WebGL failure

Provide a child-safe fallback if WebGL initialization fails.

Do not leave a blank canvas.

---

## Input Rules

Use Pointer Events where practical to unify touch and mouse.

Every drag implementation must account for:

- Small movement threshold
- Pointer capture
- Pointer cancellation
- Pointer leaving the canvas
- Browser focus loss
- Orientation changes
- Drop near, rather than exactly on, the target
- Object return animation
- Repeated rapid interactions

Interaction colliders should be larger than visible artwork.

Primary targets should generally occupy at least 64 CSS pixels, preferably 80 or more on tablets.

---

## Audio Rules

### Initialization

Audio must initialize after an explicit user gesture.

The startup Play action should resume or create the audio context.

### Channels

Use logical channels:

- Speech
- Instructions
- Educational target sounds
- Effects
- Music
- Ambient audio

### Priority

Instructional audio must take priority over background audio.

Do not allow multiple spoken instructions to overlap.

### Repeated taps

Repeated taps must not create an unintelligible wall of sound.

Use:

- Throttling
- Voice limits
- Channel interruption
- Debouncing where appropriate
- Short retrigger rules

### Fallbacks

Important audio must have a visual equivalent.

Production must not depend on browser text-to-speech.

Text-to-speech may exist only as a development fallback.

### Cleanup

Stop or release room-owned audio when:

- Leaving the room
- Restarting
- Pausing where appropriate
- Disposing the room
- Recovering from an error

---

## Persistence Rules

Use IndexedDB for structured save data.

Use localStorage only for tiny boot-time values or emergency fallbacks.

### Save data

Every save format must include a schema version.

Persist only:

- Settings
- Skill progress
- Room progress
- Saved creatures
- Completed tutorials
- Build-safe diagnostic metadata

Do not persist:

- Names
- Birth dates
- Email addresses
- Location
- Device identifiers
- Audio recordings
- Free-form child text

### Validation

Persisted data must be validated before use.

On corruption:

1. Preserve valid sections where possible.
2. Apply safe defaults.
3. Record a local diagnostic event.
4. Keep the game playable.

### Migrations

Migrations must be:

- Sequential
- Tested
- Idempotent where possible
- Safe when interrupted
- Able to recover from partial invalid data

### Writes

Avoid writing to IndexedDB on every frame or every minor interaction.

Batch or debounce noncritical progress writes.

Save before important navigation when practical.

---

## Accessibility Rules

All global controls must have accessible DOM equivalents.

At minimum:

- Start
- Home
- Settings
- Replay instruction
- Pause where present

Support:

- Keyboard activation
- Visible focus
- Screen-reader labels
- Reduced motion
- Reduced effects
- Volume settings
- High-contrast interaction outlines

Color must not be the only indicator of meaning.

Reduced-motion mode must be considered during feature design, not added as an afterthought.

---

## Asset Rules

### Formats

Prefer:

- GLB or glTF for 3D
- WebP or AVIF with suitable fallback for raster assets
- SVG for UI icons
- OGG plus MP3 fallback for audio
- JSON for metadata

### Paths

All asset paths must be base-path aware.

### Loading

Use loading tiers:

1. Startup UI
2. Playroom shell
3. Lazy-loaded room assets

Do not load all five rooms before showing the start screen.

### Failure handling

If a noncritical asset fails:

- Use a fallback primitive or material.
- Continue when safe.
- Log locally.

If a critical room asset fails:

- Show a friendly retry state.
- Provide Home and Retry.
- Do not expose technical errors to the child.

### Budgets

Treat asset and bundle size as engineering constraints.

Large additions must include justification and, where possible, build-size reporting.

---

## Offline and Service Worker Rules

Offline support must enhance the application, not become a single point of failure.

The service worker must:

- Cache hashed production assets.
- Avoid caching failed responses.
- Update safely.
- Avoid trapping users on permanently stale versions.
- Never interrupt an active activity with an update.
- Permit recovery if cache installation fails.

Do not depend on:

- Remote fonts
- Remote runtime scripts
- CDN imports
- Remote audio
- Remote 3D models
- Third-party APIs

---

## Error Handling Rules

### Child-facing behavior

Never display:

- Stack traces
- Raw exception messages
- Browser alerts
- Developer terminology
- Blank error pages

Use:

- Friendly character reactions
- Retry
- Home
- Automatic state reset
- Last-known-stable recovery

### Error boundaries

Use boundaries around:

- Application root
- Individual rooms
- Parent settings
- Optional diagnostics

### Recovery

Activities should be able to recover from:

- Animation completion never firing
- Audio promise rejection
- Drag cancellation
- Missing object references
- Persisted-state failure
- Asset load failure
- WebGL context loss where practical
- Visibility change during interaction

### Logging

Diagnostics must remain local and bounded.

Do not add remote error reporting without explicit human approval.

---

## Testing Requirements

No feature is complete without appropriate tests.

### Unit tests

Required for:

- Generators
- Validators
- State transitions
- Skill progression
- Difficulty adjustment
- Drop validation
- Audio-priority decisions
- Persistence migrations
- Seeded randomness
- Serialization

### Integration tests

Required for:

- Activity logic with render adapters
- Settings and state stores
- Audio coordination
- Persistence loading and recovery
- Room lifecycle
- Pause and resume
- Home navigation

### End-to-end tests

Critical flows must test:

1. Application loads under a repository subpath.
2. Play gesture initializes audio.
3. User enters and exits a room.
4. One activity can be completed.
5. Progress survives reload.
6. Settings persist.
7. Reduced motion is respected.
8. Offline mode works after initial load.
9. Asset failure provides recovery.
10. Repeated rapid input does not break the flow.

### Visual tests

Use deterministic seeds and stable viewport sizes.

Pause or control animation time for screenshots.

### Regression tests

Every fixed defect should add a regression test when reasonably possible.

Procedural defects must record the failing seed.

---

## Required Validation Commands

Use the repository’s package manager and scripts.

Before considering a change complete, run the equivalent of:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

When present, also run:

```bash
npm run test:visual
npm run test:performance
npm run preview:pages
```

Do not claim success if a required command was not run.

If a command cannot be run in the current environment, state that clearly in the final report.

Do not disable, skip, or weaken tests merely to make validation pass.

---

## GitHub Pages Validation

Every change involving routing, assets, service workers, or build configuration must be tested under a non-root path.

During implementation phases, a successful local production preview at the configured repository subpath is sufficient verification. A live GitHub Pages deployment, Git remote, repository settings, or completed hosted workflow run is not required to finish or commit a phase. Live deployment is a release/human-maintainer concern unless a human explicitly requests it.

The repository should provide a command that previews the app under a path such as:

```text
/carlys-magic-playroom/
```

Verify:

- JavaScript chunks load.
- CSS loads.
- Audio loads.
- Models load.
- Service-worker paths are correct.
- Reload does not break the application.
- Hash routes continue to work.
- Manifest icons resolve.

---

## Feature Workflow

For every meaningful feature:

### 1. Read

Read:

- The relevant section of the design document
- This file
- Existing room or engine conventions
- Related tests

### 2. Plan

Before editing, identify:

- Affected modules
- Data flow
- New or changed interfaces
- State transitions
- Failure modes
- Accessibility impact
- Reduced-motion behavior
- Persistence impact
- Test coverage
- GitHub Pages implications

### 3. Implement a vertical slice

Prefer a complete, narrow feature over a wide, incomplete implementation.

A vertical slice should include:

- Domain logic
- Rendering
- Input
- Audio where applicable
- Recovery
- Tests
- Documentation

### 4. Validate

Run the required commands.

Test on both mouse and touch emulation when relevant.

### 5. Review

Before finishing, inspect the diff for:

- Hidden server dependencies
- Root-relative paths
- Unseeded randomness
- Unmanaged timers
- Leaked event listeners
- Leaked audio
- Per-frame React state
- Missing error recovery
- Accessibility regressions
- Weak or missing tests
- Overly broad types
- Child-facing technical text

### 6. Report

Summarize:

- What changed
- Important implementation decisions
- Tests run
- Known limitations
- Follow-up work that is truly optional

---

## Change-Scope Rules

Do not perform broad unrelated refactors during a focused task.

Keep changes:

- Reviewable
- Cohesive
- Reversible
- Covered by tests

A necessary local refactor is acceptable when it directly supports the task.

Large architectural changes require:

- A documented reason
- Migration plan
- Updated tests
- Updated design notes or ADR

---

## Architecture Decision Records

Create an ADR for decisions that materially affect:

- State management
- Routing
- Persistence
- Audio engine
- Asset pipeline
- Procedural generation
- Service worker
- Rendering architecture
- Physics integration
- Localization structure
- Testing infrastructure

Store ADRs in:

```text
docs/adr/
```

Use a simple format:

```markdown
# ADR-NNN: Decision title

## Status

Accepted

## Context

Why this decision is needed.

## Decision

What is being adopted.

## Consequences

Positive and negative effects.

## Alternatives Considered

Other viable options and why they were not selected.
```

---

## Documentation Rules

Public interfaces and non-obvious invariants must be documented.

Update documentation when changing:

- Room contracts
- Activity schemas
- Save formats
- Build commands
- Deployment steps
- Test commands
- Asset conventions
- State-machine conventions
- Accessibility behavior

Do not document obvious syntax.

Document why, not only what.

---

## Room-Specific Minimum Requirements

### Tiny Delivery Train

Must test:

- Requested count is achievable
- Correct color and category matching
- Forgiving drop zones
- Duplicate-drop prevention
- Counted audio sequence
- Safe rejection
- Completion only once
- Deterministic generation

### Build-a-Critter Lab

Must test:

- Socket compatibility
- Part replacement
- Valid serialization
- No invalid creature state
- Safe missing-asset fallback
- Saved creature migration

### Little Garden

Must test:

- Deterministic simulation
- Repeated tap throttling
- Positive outcomes for all actions
- Growth-stage transitions
- Safe pause and resume
- No harmful failure state

### Magic Shape Factory

Must test:

- Puzzle solvability
- No unintended ambiguity
- Conveyor pause during drag
- Drop-zone forgiveness
- Machine sequence cannot deadlock
- Correct hint reduction

### Musical Corner

Must test:

- Audio does not overlap incorrectly
- Target sound can be replayed
- Rapid taps are bounded
- Choices simplify after repeated mismatch
- Audio context recovery
- Visual equivalents exist

---

## Parent Area Rules

The parent gate is an accidental-access deterrent, not security.

Parent controls must:

- Be keyboard accessible
- Persist locally
- Use adult-readable language
- Avoid negative labels about the child
- Confirm destructive reset actions
- Allow complete local data deletion
- Show build information for diagnostics

Do not imply that local progress is a diagnosis or formal assessment.

---

## Performance Review Checklist

Before merging a 3D or animation-heavy feature, inspect:

- Draw-call count
- Geometry count
- Material count
- Texture size
- Audio size
- Room bundle size
- Memory cleanup after exit
- Frame stability during interaction
- React render frequency
- Particle limits
- Shadow cost
- Low-quality mode behavior

A visually attractive feature that causes unstable interaction is not complete.

---

## Dependency Rules

Before adding a dependency:

1. Confirm the problem cannot be solved cleanly with an existing dependency.
2. Confirm the package works in a static Vite build.
3. Confirm it does not require Node.js at runtime.
4. Check bundle impact.
5. Check maintenance activity and license.
6. Add tests around critical integration behavior.

Do not add overlapping libraries for the same role without a strong reason.

---

## Security Rules

Do not use:

- `eval`
- Runtime code loading from third-party origins
- Unsanitized `dangerouslySetInnerHTML`
- Untrusted content execution
- Runtime secrets
- Exposed credentials
- Tracking identifiers

Treat imported JSON and persisted save data as untrusted until validated.

---

## Commit and Pull Request Guidance

When preparing a commit or pull request, use a focused title.

Commit each implementation phase after its applicable local validation gates pass and its `PLAN.md` evidence is current. Do not combine multiple completed phases in one commit. Live deployment status must not delay an otherwise complete phase commit.

The description should include:

- User-visible behavior
- Technical approach
- Tests run
- GitHub Pages impact
- Accessibility impact
- Performance impact
- Known limitations

Do not describe unrun tests as passing.

---

## Definition of Done

A feature is done only when all relevant statements are true:

- It works with touch and mouse.
- It behaves safely under repeated input.
- It has no child-facing dead end.
- It has a recovery path.
- It respects volume settings.
- It respects reduced motion.
- It does not require a server.
- It works under the GitHub Pages base path.
- It does not introduce remote tracking.
- It has appropriate automated tests.
- It cleans up timers.
- It cleans up event listeners.
- It cleans up audio.
- It cleans up animation resources.
- It handles asset failure.
- It handles pause and resume where relevant.
- It preserves or safely migrates persisted data.
- It does not produce normal-flow console errors.
- Public interfaces and important invariants are documented.
- Required validation commands have passed, or any inability to run them is explicitly reported.

---

## Agent Final-Response Format

At the end of an implementation task, report:

### Changed

A concise summary of the completed work.

### Key decisions

Only important architectural or behavioral decisions.

### Validation

List the exact commands run and whether they passed.

### Limitations

Only real remaining limitations or unverified areas.

### Files

List the most important files added or changed.

Do not include speculative future work unless it is necessary to explain a limitation.

---

## First Implementation Priority

Unless a human maintainer gives different instructions, prioritize work in this order:

1. Repository and GitHub Pages foundation
2. Startup and audio initialization
3. Central playroom shell
4. Tiny Delivery Train vertical slice
5. Shared room framework
6. Remaining rooms
7. Parent controls and accessibility
8. Offline support and adaptive quality
9. Release hardening

Do not implement all five rooms simultaneously before the Tiny Delivery Train vertical slice is polished, tested, and verified successfully in the local GitHub Pages subpath preview.

---

## Guiding Principle

The child should experience a simple, warm, forgiving toy.

The codebase should achieve that simplicity through explicit state, deterministic content, defensive engineering, clear boundaries, strong testing, local-first privacy, and reliable static deployment.
