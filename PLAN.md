# IMPLEMENTATION_PLAN.md

## Carly’s Magic Playroom — Multi-Phase Implementation Plan

**Purpose:** This document is the canonical implementation tracker for Carly’s Magic Playroom.

It is designed for use by coding agents and human maintainers. Every task must be checked off only after its implementation and verification requirements are complete.

The agent must read this file at the beginning of every implementation session and update it before finishing.

---

## 1. How to Use This Document

### Status markers

Use exactly these markers:

- `[ ]` Not started
- `[-]` In progress
- `[x]` Complete and verified
- `[!]` Blocked
- `[~]` Implemented but not fully verified
- `[N/A]` Intentionally not applicable

A task may be marked `[x]` only when:

1. The implementation is complete.
2. Required automated tests pass.
3. Required manual checks are complete.
4. Documentation is updated where applicable.
5. No unresolved blocker remains.
6. The verification evidence is recorded in this document.

### Agent session procedure

At the start of every coding session:

1. Read `AGENTS.md`.
2. Read the product design document.
3. Read this implementation plan.
4. Inspect the repository state.
5. Identify the first incomplete task whose dependencies are satisfied.
6. Mark that task `[-]`.
7. Implement the smallest complete vertical slice.
8. Run the required validation commands.
9. Update this file with:
   - Final status
   - Verification evidence
   - Important implementation notes
   - Newly discovered follow-up tasks
10. Do not mark future work complete based on assumptions.
11. Commit each completed phase separately after applicable local validation passes.

### Deployment verification policy

Implementation phases require a successful local production preview under the configured GitHub Pages repository subpath. They do not require a Git remote, live GitHub Actions run, repository Pages settings, or live deployment URL. Live deployment is verified only during an explicitly requested release operation and never blocks starting the next implementation phase.

### Task ownership

Each task may optionally include:

```text
Owner: <agent, developer, or blank>
Started: YYYY-MM-DD
Completed: YYYY-MM-DD
Verified by: <agent, developer, or command>
```

### Verification evidence

Verification evidence should be concise and concrete.

Good examples:

```text
Verified:
- `npm run typecheck` passed.
- `npm run test -- train-generator` passed with 42 tests.
- Playwright completed the train activity at `/carlys-magic-playroom/`.
- Manually tested dragging with Chrome touch emulation.
```

Bad examples:

```text
Verified:
- Looks good.
- Should work.
- Tests were probably covered elsewhere.
```

---

## 2. Global Project Status

### Current phase

- [x] Phase 0 — Repository Foundation
- [x] Phase 1 — Startup and Playroom Shell
- [x] Phase 2 — Tiny Delivery Train Vertical Slice
- [x] Phase 3 — Shared Activity Framework
- [ ] Phase 4 — Build-a-Critter Lab
- [ ] Phase 5 — Little Garden
- [ ] Phase 6 — Magic Shape Factory
- [ ] Phase 7 — Musical Corner
- [ ] Phase 8 — Parent Controls and Accessibility
- [ ] Phase 9 — Offline Support and Performance
- [ ] Phase 10 — Release Hardening

### Release readiness

- [ ] Product scope complete
- [ ] Static GitHub Pages deployment verified
- [ ] All five rooms complete
- [ ] Accessibility requirements verified
- [ ] Offline mode verified
- [ ] Performance targets verified
- [ ] Privacy audit complete
- [ ] Release checklist complete

---

## 3. Shared Quality Gates

Every phase must satisfy all applicable gates before it is considered complete.

### Engineering gate

- [x] TypeScript strict mode remains enabled.
- [x] No broad `any` types were introduced without documented justification.
- [x] No required runtime server or remote API was introduced.
- [x] All asset paths are compatible with the Vite base path.
- [N/A] No unseeded procedural randomness is used in testable game logic.
- [N/A] Timers, listeners, animations, and audio resources are cleaned up.
- [N/A] Child input can be repeated without corrupting state.
- [x] Child-facing error states contain no technical language.

### Validation gate

- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run test`
- [x] `npm run build`
- [x] Relevant Playwright tests
- [x] GitHub Pages subpath preview
- [x] Touch or pointer-emulation check
- [N/A] Reduced-motion check where applicable

### Documentation gate

- [x] Public interfaces are documented.
- [x] Important invariants are documented.
- [x] New commands are added to project documentation.
- [x] Architecture decisions are recorded when required.
- [x] This implementation plan is updated.

---

# Phase 0 — Repository Foundation

## Goal

Create a clean, strictly typed Vite project that builds, tests, and deploys as a static GitHub Pages application under a repository subpath.

## Exit criteria

The application can be built and deployed through CI without a runtime server. It loads correctly from a non-root URL and has the baseline quality tooling needed for future work.

---

### P0-01 — Initialize the Vite application

- [x] Create a Vite React TypeScript project.
- [x] Enable TypeScript strict mode.
- [x] Confirm the application starts in development mode.
- [x] Remove unused starter assets and styles.
- [x] Add the project title and basic metadata.

Dependencies: None

Verification:

- [x] `npm run dev` launches successfully.
- [x] `npm run build` succeeds.
- [x] Production output contains static files only.

Evidence:

```text
Verified 2026-07-18: Vite 8.1.5 started on `127.0.0.1:5173`; `npm run build` passed and emitted only static HTML, CSS, and JavaScript.
```

---

### P0-02 — Establish repository structure

- [x] Create the agreed top-level `src` directories.
- [x] Create test directories.
- [x] Add placeholder module boundaries without implementing room logic.
- [x] Add barrel exports only where they improve clarity.
- [x] Avoid circular dependency patterns.

Dependencies: P0-01

Verification:

- [x] Imports resolve.
- [x] Build succeeds.
- [x] No empty production bundles are accidentally created.

Evidence:

```text
Verified 2026-07-18: strict typecheck and production build passed; the build emitted one application chunk with no placeholder room chunks.
```

---

### P0-03 — Add linting and formatting

- [x] Configure ESLint.
- [x] Configure Prettier.
- [x] Add scripts for linting and formatting checks.
- [x] Configure rules appropriate for React and TypeScript.
- [x] Ensure generated and asset directories are excluded.

Dependencies: P0-01

Verification:

- [x] `npm run lint` passes.
- [x] Formatting check passes.
- [x] CI runs linting.

Evidence:

```text
Verified 2026-07-18 with `npm run lint` and `npm run format:check`; the CI workflow invokes the same locked commands before deployment.
```

---

### P0-04 — Add unit and component testing

- [x] Install and configure Vitest.
- [x] Configure React Testing Library.
- [x] Add browser-like test environment where needed.
- [x] Add one basic component test.
- [x] Add one pure TypeScript unit test.
- [x] Add coverage reporting if practical.

Dependencies: P0-01

Verification:

- [x] `npm run test` passes.
- [x] Tests fail correctly when assertions are deliberately broken.

Evidence:

```text
Verified 2026-07-18: `npm run test` passed 8 tests; a temporary failing assertion returned exit code 1 and was then removed.
```

---

### P0-05 — Add end-to-end testing

- [x] Install and configure Playwright.
- [x] Add a smoke test for the startup page.
- [x] Configure a desktop browser project.
- [x] Configure a tablet-sized project.
- [x] Add support for testing a production build.

Dependencies: P0-01

Verification:

- [x] `npm run test:e2e` passes.
- [x] Tablet viewport test passes.
- [x] Test artifacts are retained on failure.

Evidence:

```text
Verified 2026-07-18: Playwright passed 4/4 desktop and tablet Chromium tests against the production subpath preview; an earlier intentional failure retained screenshot, video, trace, and error context artifacts.
```

---

### P0-06 — Configure Vite base path

- [x] Make the production base path configurable.
- [x] Add a shared base-aware asset URL helper.
- [x] Prohibit root-relative runtime asset paths.
- [x] Document local root hosting and GitHub Pages subpath hosting.
- [x] Add a test or linting convention for base-path-safe assets.

Dependencies: P0-01

Verification:

- [x] App loads from `/`.
- [x] App loads from `/carlys-magic-playroom/`.
- [x] JavaScript and CSS chunks resolve under both paths.

Evidence:

```text
Verified 2026-07-18: root and Pages builds passed; Playwright passed 2/2 root-hosted desktop checks and loaded JavaScript and CSS from `/carlys-magic-playroom/` in both desktop and tablet projects.
```

---

### P0-07 — Configure GitHub Actions

- [x] Add continuous integration workflow.
- [x] Install dependencies using the lockfile.
- [x] Run linting.
- [x] Run type checking.
- [x] Run unit tests.
- [x] Build the application.
- [x] Run selected end-to-end smoke tests.
- [x] Block deployment on validation failure.

Dependencies: P0-03, P0-04, P0-05, P0-06

Verification:

- [x] CI validation commands succeed locally.
- [x] A deliberately failing test returns a blocking nonzero status.

Evidence:

```text
Verified 2026-07-18 by running the workflow's locked validation sequence locally. A temporary failing assertion exited 1, which blocks the sequential workflow before deployment.
```

---

### P0-08 — Configure GitHub Pages deployment

- [x] Add Pages deployment workflow or deployment job.
- [x] Upload the Vite build artifact.
- [x] Deploy only after validation succeeds.
- [x] Document repository Pages settings.
- [x] Confirm the configured base path matches the repository path.

Dependencies: P0-07

Verification:

- [x] Local Pages preview URL loads successfully.
- [x] Reloading the local Pages preview does not break the app.
- [x] Assets resolve under the repository subpath preview.
- [x] No server-side functionality is required.

Evidence:

```text
Verified 2026-07-18 with the production build served at `/carlys-magic-playroom/`; desktop and tablet Playwright projects passed 4/4 checks with base-aware JavaScript and CSS.
```

---

### P0-09 — Add application error boundary

- [x] Add a root error boundary.
- [x] Add a friendly child-safe fallback.
- [x] Provide Retry and Home or Reload actions.
- [x] Log technical details locally in development.
- [x] Avoid rendering raw stack traces in production.

Dependencies: P0-01

Verification:

- [x] A deliberately thrown render error shows the safe fallback.
- [x] Technical details remain hidden in production UI.

Evidence:

```text
Verified 2026-07-18 by `RootErrorBoundary.test.tsx`, including retry and absence of the thrown technical message.
```

---

### P0-10 — Add build metadata and diagnostics foundation

- [x] Expose build version.
- [x] Expose build date or commit identifier where available.
- [x] Add a bounded local diagnostic interface.
- [x] Ensure diagnostics contain no personal data.
- [x] Make diagnostics invisible in normal child-facing use.

Dependencies: P0-01

Verification:

- [x] Build metadata appears in developer or parent diagnostics.
- [x] Diagnostics storage is bounded and clearable.

Evidence:

```text
Verified 2026-07-18 by unit tests and desktop/tablet Playwright checks. Diagnostics retain at most 50 category/code/time records and are visible only with `?diagnostics=1`.
```

---

## Phase 0 completion gate

- [x] All Phase 0 tasks are complete and verified.
- [x] Static Pages artifact works from the configured repository subpath preview.
- [x] Required validation commands pass.
- [x] No runtime server dependency exists.
- [x] Phase 0 completion is recorded in the changelog.

---

# Phase 1 — Startup and Playroom Shell

## Goal

Create the child-safe startup flow, initialize browser audio after a user gesture, and provide the first navigable central playroom shell.

## Exit criteria

A child can launch the app, tap Play, enter a placeholder room, return home, and repeat this flow without breaking navigation.

---

### P1-01 — Create startup screen

- [x] Add branded loading state.
- [x] Add a large Play button.
- [x] Add accessible DOM labeling.
- [x] Handle slow critical-asset loading.
- [x] Keep the button disabled only when strictly necessary.
- [x] Add a safe retry state for startup failure.

Dependencies: Phase 0

Verification:

- [x] Startup screen works with mouse.
- [x] Startup screen works with touch emulation.
- [x] Keyboard activation works.
- [x] Button target meets size guidance.

Evidence:

```text
Verified 2026-07-18 by `StartupScreen.test.tsx` and desktop/tablet Playwright. Play is a 5rem target, activates with Enter, and loading/error states retain friendly status and Retry behavior.
```

---

### P1-02 — Implement audio initialization

- [x] Create the audio service abstraction.
- [x] Initialize or resume audio only after Play is activated.
- [x] Detect suspended audio context.
- [x] Add safe retry behavior.
- [x] Add global mute or volume foundation.
- [x] Ensure audio initialization failure does not block visual play.

Dependencies: P1-01

Verification:

- [x] Audio initializes after the Play gesture.
- [x] No autoplay error appears during normal startup.
- [x] Visual gameplay remains available when audio fails.
- [x] Repeated Play activation is idempotent.

Evidence:

```text
Verified 2026-07-18 by `audioService.test.ts` and Playwright. Suspended contexts resume, simultaneous initialization is idempotent, failures can retry, and visual navigation proceeds independently.
```

---

### P1-03 — Create application navigation state

- [x] Define child-facing app states.
- [x] Implement internal navigation or hash routing.
- [x] Avoid history fallback requirements.
- [x] Add typed room IDs.
- [x] Add guarded transitions.
- [x] Add safe return-to-home behavior.

Dependencies: P1-01

Verification:

- [x] App can transition from startup to playroom.
- [x] App can enter and exit a placeholder room.
- [x] Rapid repeated navigation does not duplicate transitions.

Evidence:

```text
Verified 2026-07-18 by pure reducer tests and desktop/tablet Playwright start → train → replay → home flows. Stale and duplicate events preserve the current guarded state.
```

---

### P1-04 — Create central playroom shell

- [x] Add the root 3D canvas.
- [x] Add basic lighting.
- [x] Add controlled camera.
- [x] Add five room portal placeholders.
- [x] Give each portal a distinct visual identity.
- [x] Add oversized pointer targets.
- [x] Add gentle idle animations.

Dependencies: P1-03

Verification:

- [x] All five portals render.
- [x] Portal interaction works on mouse and touch.
- [x] Frame rate remains stable on the agreed test machine.

Evidence:

```text
Verified 2026-07-18 in desktop and touch-enabled tablet Chromium. All five DOM/Canvas portals render; primary DOM targets exceed 64px. A 45-frame desktop Chromium probe passed with the 95th-percentile interval below 40ms.
```

---

### P1-05 — Implement room transition system

- [x] Add camera movement into a selected room.
- [x] Add loading cover or decorative transition.
- [x] Add transition locking.
- [x] Ignore duplicate portal taps safely.
- [x] Add reduced-motion transition alternative.
- [x] Add transition cancellation or recovery.

Dependencies: P1-04

Verification:

- [x] Normal transition works.
- [x] Reduced-motion mode avoids long camera motion.
- [x] Rapid repeated taps do not corrupt app state.
- [x] Failed room load returns to a safe state.

Evidence:

```text
Verified 2026-07-18 with reducer, RoomHost, and Playwright tests. Reduced motion replaces the 650ms camera transition with an 80ms fade; owned timers cancel on navigation; room load failures expose Retry and Home.
```

---

### P1-06 — Implement global child controls

- [x] Add Home.
- [x] Add Replay Instruction placeholder.
- [x] Add Settings entry point.
- [x] Add accessible DOM equivalents.
- [x] Keep controls away from drag areas.
- [N/A] Prevent controls from firing during active drag where required.

Dependencies: P1-03

Verification:

- [x] Controls work with pointer and keyboard.
- [x] Home always returns to the playroom.
- [x] Controls have visible focus states.

Evidence:

```text
Verified 2026-07-18 by desktop/tablet Playwright, including keyboard Play, Escape-to-close settings, Replay live feedback, Home navigation, 68px controls, and visible focus styling. Phase 1 has no drag state yet.
```

---

### P1-07 — Add room lazy-loading foundation

- [x] Define room module contract.
- [x] Add asynchronous room loading.
- [x] Add per-room loading fallback.
- [x] Add per-room error boundary.
- [x] Dispose room resources on exit.
- [x] Confirm room code is split into separate chunks.

Dependencies: P1-03

Verification:

- [x] Placeholder room loads lazily.
- [x] Room bundle is not loaded before selection.
- [x] Room disposal removes active listeners and timers.

Evidence:

```text
Verified 2026-07-18 by RoomHost lifecycle tests and `npm run build:pages`. The startup chunk is 205.59kB, Three.js is isolated behind Play, and five independent 0.28–0.31kB room chunks load only through dynamic imports.
```

---

## Phase 1 completion gate

- [x] All Phase 1 tasks are complete and verified.
- [x] Startup, playroom entry, room entry, and home return work.
- [x] Audio initialization is gesture-safe.
- [x] Reduced-motion transitions work.
- [x] Navigation survives repeated input.
- [x] Phase 1 completion is recorded in the changelog.

---

# Phase 2 — Tiny Delivery Train Vertical Slice

## Goal

Implement one complete, polished educational activity that exercises the core game architecture end to end.

## Reference scenario

The child is asked to put two yellow ducks into the train car. Each correct duck is counted aloud. The train departs, arrives at a destination, and triggers a celebration.

## Exit criteria

The activity is deterministic, solvable, touch-friendly, recoverable, persistent, tested, and verified in the local GitHub Pages subpath preview.

---

### P2-01 — Define train domain types

- [x] Define train activity definition.
- [x] Define train object metadata.
- [x] Define instruction model.
- [x] Define success conditions.
- [x] Define train activity events.
- [x] Define serializable state.

Dependencies: Phase 1

Verification:

- [x] Domain model has no rendering dependency.
- [x] Definitions serialize and deserialize safely.
- [x] Type tests or unit tests cover required invariants.

Evidence:

```text
Verified 2026-07-18 by train generator, validator, and state-machine tests. Domain modules import no React or Three.js code and validated definitions round-trip through JSON.
```

---

### P2-02 — Implement seeded random source

- [x] Add a shared seeded random interface.
- [x] Add deterministic number generation.
- [x] Add `pick`, `shuffle`, and integer helpers.
- [x] Reject invalid ranges.
- [x] Document deterministic behavior.

Dependencies: Phase 0

Verification:

- [x] Same seed produces identical output.
- [x] Different seeds produce expected variation.
- [x] Randomness tests pass across repeated runs.

Evidence:

```text
Verified 2026-07-18 by `randomSource.test.ts`; empty seeds, invalid ranges, and empty picks are rejected while fixed sequences, inclusive integers, and immutable shuffles are repeatable.
```

---

### P2-03 — Implement train activity generator

- [x] Generate requested count.
- [x] Generate target category.
- [x] Generate target color.
- [x] Generate available objects.
- [x] Generate controlled distractors.
- [x] Guarantee at least one valid solution.
- [x] Include seed in generated definition.
- [x] Add bounded regeneration for invalid output.

Dependencies: P2-01, P2-02

Verification:

- [x] Fixed-seed tests pass.
- [x] Property tests confirm solvability.
- [x] Requested counts never exceed matching objects.
- [x] Object IDs are unique.

Evidence:

```text
Verified 2026-07-18 across 300 generated seeds and all three difficulty levels. Every definition has exactly the requested matches, unique IDs, controlled distractors, and valid JSON serialization.
```

---

### P2-04 — Implement train activity state machine

- [x] Add intro state.
- [x] Add instruction state.
- [x] Add waiting state.
- [x] Add evaluation state.
- [x] Add hint state.
- [x] Add celebration state.
- [x] Add completion state.
- [x] Add pause, exit, reset, and error recovery.
- [x] Ignore or safely handle unexpected events.
- [x] Prevent duplicate completion.

Dependencies: P2-01

Verification:

- [x] All documented transitions have tests.
- [x] Repeated drop events do not duplicate inventory.
- [x] Every state can reach safe exit.
- [x] Timers are cleaned up.

Evidence:

```text
Verified 2026-07-18 by `trainMachine.test.ts`. Duplicate inventory, bounded hints, completion-once, pause/resume, reset, recovery, and idempotent exit are covered; room timers use the owned lifecycle utility.
```

---

### P2-05 — Create train scene

- [x] Add train engine.
- [x] Add one large train car.
- [x] Add loading platform.
- [x] Add destination.
- [x] Add decorative scenery.
- [x] Add basic character or face feedback.
- [x] Use fallback primitives where final assets are absent.

Dependencies: P2-01

Verification:

- [x] Scene loads independently.
- [x] Missing decorative asset does not break the activity.
- [x] Scene meets initial performance budget.

Evidence:

```text
Verified 2026-07-18 in the lazy train chunk using shared low-poly primitives only. The train module is 21.38kB minified/7.45kB gzip excluding the shared R3F runtime.
```

---

### P2-06 — Implement 3D drag-and-drop

- [x] Use Pointer Events.
- [x] Use pointer capture.
- [x] Add drag threshold.
- [x] Add oversized interaction colliders.
- [x] Project movement onto a stable interaction plane.
- [x] Add forgiving train-car drop zones.
- [x] Add safe rejected-object return.
- [x] Handle pointer cancellation.
- [x] Handle pointer leaving the canvas.
- [x] Handle visibility change during drag.

Dependencies: P2-05

Verification:

- [x] Mouse dragging works.
- [x] Touch emulation works.
- [x] Near drops snap successfully.
- [x] Invalid drops recover.
- [x] Rapid repeated drags do not corrupt state.

Evidence:

```text
Verified 2026-07-18 by desktop/tablet Chromium pointer movement into an oversized transparent drop region plus state-machine duplicate guards. R3F drags use capture, a 6px threshold, ray/plane projection, forgiving bounds, animated return, and blur/orientation/visibility cleanup.
```

---

### P2-07 — Implement validation and inventory

- [x] Validate category.
- [x] Validate color.
- [x] Validate requested count.
- [x] Prevent duplicate loading.
- [x] Count loaded objects.
- [N/A] Allow safe removal or return if required.
- [x] Complete only when success conditions are met.

Dependencies: P2-03, P2-04, P2-06

Verification:

- [x] Correct objects are accepted.
- [x] Incorrect objects are rejected gently.
- [x] Completion occurs exactly once.
- [x] Loaded count matches the state machine.

Evidence:

```text
Verified 2026-07-18 by unit and E2E coverage. The fixed scenario rejects a distractor without penalty, accepts two yellow ducks, displays counts one and two, and enters celebration once.
```

---

### P2-08 — Add train instructions and counting audio

- [x] Add instruction templates.
- [x] Add prerecorded or placeholder voice assets.
- [x] Add audio keys rather than hardcoded file calls.
- [x] Count accepted objects aloud.
- [x] Prevent overlapping count and instruction speech.
- [x] Add replay instruction.
- [x] Add visual equivalents.

Dependencies: P1-02, P2-04, P2-07

Verification:

- [x] Instruction plays once per round.
- [x] Replay works.
- [x] Count audio is correctly ordered.
- [x] Rapid input does not overlap speech unintelligibly.
- [x] Muted mode remains fully playable.

Evidence:

```text
Verified 2026-07-18 by `trainAudio.test.ts` and desktop/tablet Playwright. Five approved Ava neural TTS lines are bundled as ten OGG/MP3 files; instruction, count, and success cues serialize in action order, Replay interrupts, and muted or failed audio never blocks visual play.
```

---

### P2-09 — Add hint sequence

- [x] Add idle timer.
- [x] Add first visual hint.
- [x] Add repeated instruction.
- [x] Add stronger target highlighting.
- [x] Add optional distractor reduction.
- [x] Cancel hints immediately on interaction.
- [x] Respect configurable hint delay.

Dependencies: P2-04, P2-07, P2-08

Verification:

- [x] Hints escalate in the intended order.
- [x] Interaction cancels pending hints.
- [x] Hints do not continue after room exit.
- [x] Reduced-motion mode adjusts hint animation.

Evidence:

```text
Verified 2026-07-18 by state-machine/audio tests and owned timer lifecycles. The first hint repeats serialized speech; the train car glow, target highlight, and distractor reduction escalate to level 3; interaction/replay restarts the timer and reduced motion suppresses wiggles.
```

---

### P2-10 — Add train departure and celebration

- [x] Lock loading interaction after completion.
- [x] Play departure animation.
- [x] Move or transition to destination.
- [x] Trigger success sound.
- [x] Trigger visual celebration.
- [x] Respect reduced effects.
- [x] Return to next round or idle state.
- [x] Recover if an animation completion event fails.

Dependencies: P2-07, P2-08

Verification:

- [x] Celebration occurs once.
- [x] Reduced-motion mode uses a safe alternative.
- [x] Watchdog can recover from interrupted animation.
- [x] Home remains available at a safe point.

Evidence:

```text
Verified 2026-07-18 in desktop/tablet Chromium and audio queue tests. Interaction locks, the train departs, the serialized “All aboard!” cue follows the final count, reduced motion shortens completion to 250ms, an owned watchdog advances to Play again, and Home remains present.
```

---

### P2-11 — Persist train progress

- [x] Define train progress model.
- [x] Save completed activity count.
- [x] Save skill outcomes.
- [x] Save last-played timestamp.
- [N/A] Debounce noncritical writes.
- [x] Recover from storage failure.
- [x] Add migration test.

Dependencies: P2-10

Verification:

- [x] Progress survives reload.
- [x] Corrupt train progress falls back safely.
- [x] Storage failure does not stop gameplay.

Evidence:

```text
Verified 2026-07-18 with fake IndexedDB unit tests and desktop/tablet reload E2E. Completion transactions are idempotent, retain bounded recent IDs, migrate schema 0, preserve valid skill sections, and fall back nonfatally. Only critical completion writes exist, so debounce is not applicable.
```

---

### P2-12 — Add train end-to-end coverage

- [x] Start app.
- [x] Enter train room.
- [x] Complete fixed-seed duck activity.
- [x] Verify counting.
- [x] Verify celebration.
- [x] Return home.
- [x] Reload.
- [x] Verify saved progress.
- [x] Repeat under repository subpath.
- [x] Run tablet viewport.

Dependencies: P2-01 through P2-11

Verification:

- [x] Train E2E suite passes locally.
- [x] Train E2E suite is configured for CI.
- [x] Fixed-seed screenshot is stable.

Evidence:

```text
Verified 2026-07-18: the fixed scenario passed 2/2 desktop/tablet subpath tests, including distractor rejection, pointer drag, requested audio order, visual counts, celebration, reload, saved trip count, and stable per-viewport screenshot baselines.
```

---

## Phase 2 completion gate

- [x] All Phase 2 tasks are complete and verified.
- [x] Tiny Delivery Train passes the local GitHub Pages subpath preview.
- [x] Fixed-seed scenario is reproducible.
- [x] Touch and mouse behavior are verified.
- [x] Persistence is verified.
- [x] Recovery behavior is verified.
- [x] Phase 2 completion is recorded in the changelog.

---

# Phase 3 — Shared Activity Framework

## Goal

Extract reusable systems only after the train vertical slice has demonstrated the required behavior.

## Exit criteria

A mock activity and at least one second room can use shared contracts without duplicating train-specific logic.

---

### P3-01 — Formalize room module contract

- [x] Define preload lifecycle.
- [x] Define session creation.
- [x] Define start, pause, resume, restart, exit, and dispose.
- [x] Define room capability metadata.
- [x] Add contract tests.
- [x] Migrate train room to the contract.

Dependencies: Phase 2

Verification:

- [x] Train room passes unchanged behavior tests.
- [x] Mock room implements the contract.
- [x] Disposal removes room-owned resources.

Evidence:

```text
Verified 2026-07-18 by `roomSession.test.ts`, `RoomHost.test.tsx`, and the train E2E regression. Lazy modules expose capabilities/preload/session factories; RoomHost starts and idempotently exits/disposes sessions, and all placeholder rooms use the same contract.
```

---

### P3-02 — Create shared activity state primitives

- [x] Define common phases.
- [x] Define common lifecycle events.
- [x] Add typed transition helpers.
- [x] Add timer ownership utilities.
- [x] Add watchdog support.
- [x] Keep room-specific events extensible.

Dependencies: P3-01

Verification:

- [x] Train state machine uses shared primitives.
- [x] Unexpected events remain safe.
- [x] Timer cleanup tests pass.

Evidence:

```text
Verified 2026-07-18 by activity, timer, and train-machine tests. Common lifecycle transitions return control for room events, while deterministic owned timers cancel schedules and watchdogs together.
```

---

### P3-03 — Create shared instruction system

- [x] Define instruction templates.
- [x] Define audio keys.
- [x] Define parameter substitution.
- [x] Add replay behavior.
- [x] Add visual instruction representation.
- [x] Prepare for localization.

Dependencies: P2-08

Verification:

- [x] Train instructions migrate successfully.
- [x] Missing audio uses safe fallback behavior.
- [x] Templates remain serializable.

Evidence:

```text
Verified 2026-07-18 by `instruction.test.ts` and train E2E. Named parameters render through keyed templates, definitions survive JSON, and missing/rejected audio leaves the visual instruction usable.
```

---

### P3-04 — Create shared hint engine

- [x] Define hint steps.
- [x] Define timing.
- [x] Define escalation.
- [x] Add cancellation.
- [x] Add simplification hooks.
- [x] Add reduced-motion behavior.

Dependencies: P2-09

Verification:

- [x] Train hints migrate without regression.
- [x] Hint timers clean up on pause, reset, and exit.
- [x] Hint escalation has unit tests.

Evidence:

```text
Verified 2026-07-18 by `hintPlan.test.ts`, train-machine tests, and owned timer cleanup. The three data-defined steps cover repeat, highlight, simplification, and reduced-motion outlines.
```

---

### P3-05 — Create shared draggable object system

- [x] Extract pointer lifecycle.
- [x] Extract drag-plane projection.
- [x] Extract target-zone evaluation.
- [x] Extract snap and return animations.
- [x] Expose room-specific validation hooks.
- [x] Preserve oversized colliders.
- [x] Add cancellation recovery.

Dependencies: P2-06

Verification:

- [x] Train behavior remains unchanged.
- [x] Mock draggable scenario passes.
- [x] Pointer cancellation tests pass.

Evidence:

```text
Verified 2026-07-18 by `pointerDrag.test.ts` and desktop/tablet train E2E. DOM and R3F adapters share ownership, threshold, forgiving target, projection, and snap helpers while retaining train validation and oversized targets.
```

---

### P3-06 — Create shared audio coordinator

- [x] Define channels.
- [x] Define priorities.
- [x] Define interruption and ducking rules.
- [x] Add voice limits.
- [x] Add room ownership.
- [x] Add mute and volume integration.
- [x] Add context resume recovery.

Dependencies: P1-02, P2-08

Verification:

- [x] Train audio migrates without overlap regression.
- [x] Room exit stops room-owned audio.
- [x] Priority tests pass.

Evidence:

```text
Verified 2026-07-18 by coordinator/train audio tests and E2E request order. Six channels use explicit priority, one active voice, instruction ducking, Replay interruption, room-owner cleanup, current settings, and gesture-context resume recovery.
```

---

### P3-07 — Create persistence schema and migrations

- [x] Define root save-data format.
- [x] Add schema version.
- [x] Add validators.
- [x] Add migration pipeline.
- [x] Add partial recovery.
- [x] Add reset operations.
- [x] Add bounded diagnostics.

Dependencies: P2-11

Verification:

- [x] Fresh install works.
- [x] Current save loads.
- [x] Invalid subsection recovers.
- [x] Migration suite passes.

Evidence:

```text
Verified 2026-07-18 by `saveData.test.ts` and train progress tests. IndexedDB v2 validates a versioned root, migrates the v1 train store, bounds collections/diagnostic codes, preserves valid subsections, and supports complete reset.
```

---

### P3-08 — Add shared testing helpers

- [x] Add seeded fixtures.
- [x] Add state-machine test harness.
- [x] Add room lifecycle harness.
- [x] Add fake audio service.
- [x] Add fake persistence service.
- [x] Add deterministic animation clock.
- [x] Add pointer interaction helpers.

Dependencies: P3-01 through P3-07

Verification:

- [x] Train tests use the shared helpers.
- [x] Visual tests no longer depend on real time.
- [x] Helpers are documented.

Evidence:

```text
Verified 2026-07-18 by `testingHelpers.test.ts` plus migrated train generator/machine and shared subsystem tests. Fixed seeds, disabled browser animations, deterministic clocks, pointer paths, fake audio/persistence, and lifecycle/reducer harnesses are documented in `src/testing/README.md`.
```

---

## Phase 3 completion gate

- [x] All Phase 3 tasks are complete and verified.
- [x] Train room has migrated without behavioral regression.
- [x] Shared systems are documented and tested.
- [x] No premature generic abstraction remains unused.
- [x] Phase 3 completion is recorded in the changelog.

---

# Phase 4 — Build-a-Critter Lab

## Goal

Implement a creative, failure-free creature assembly activity using shared room systems.

## Exit criteria

The child can assemble, animate, save, reload, and replace a creature without ever creating an invalid state.

---

### P4-01 — Define critter data model

- [ ] Define bodies.
- [ ] Define socket IDs.
- [ ] Define compatible parts.
- [ ] Define colors and patterns.
- [ ] Define reactions.
- [ ] Define serialized saved creature format.
- [ ] Define versioning.

Dependencies: Phase 3

Verification:

- [ ] Model is serializable.
- [ ] Socket IDs are exhaustive.
- [ ] Invalid part compatibility is rejected.

Evidence:

```text
Not yet verified.
```

---

### P4-02 — Implement critter assembly rules

- [ ] Add one active body.
- [ ] Add eye placement.
- [ ] Add mouth placement.
- [ ] Add leg placement.
- [ ] Add part replacement.
- [ ] Add automatic snapping.
- [ ] Prevent invalid creature state.
- [ ] Ensure every selection produces a valid creature.

Dependencies: P4-01

Verification:

- [ ] All allowed combinations assemble.
- [ ] Replacement works.
- [ ] Invalid socket combinations fail safely.
- [ ] No alignment precision is required.

Evidence:

```text
Not yet verified.
```

---

### P4-03 — Create critter lab scene

- [ ] Add assembly platform.
- [ ] Add part trays.
- [ ] Add attachment indicators.
- [ ] Add preview or mirror area.
- [ ] Add celebration stage.
- [ ] Add large interaction targets.

Dependencies: P4-01

Verification:

- [ ] Scene performs within budget.
- [ ] Missing decorative assets do not break assembly.
- [ ] Targets work with touch.

Evidence:

```text
Not yet verified.
```

---

### P4-04 — Add guided assembly flow

- [ ] Introduce one category at a time.
- [ ] Name each body part aloud.
- [ ] Add visual demonstration.
- [ ] Add replay.
- [ ] Add hint escalation.
- [ ] Allow free replacement before completion.

Dependencies: P4-02, P4-03, Phase 3 shared systems

Verification:

- [ ] Child can complete without reading.
- [ ] Repeated selections remain safe.
- [ ] Audio does not overlap incorrectly.

Evidence:

```text
Not yet verified.
```

---

### P4-05 — Add critter animation and reactions

- [ ] Add completed-creature reveal.
- [ ] Add at least three reactions.
- [ ] Add tap-to-react.
- [ ] Add reduced-motion alternatives.
- [ ] Add fallback animation behavior.

Dependencies: P4-04

Verification:

- [ ] Reactions do not overlap incorrectly.
- [ ] Rapid taps are bounded.
- [ ] Reduced motion remains engaging.

Evidence:

```text
Not yet verified.
```

---

### P4-06 — Persist saved creatures

- [ ] Save completed creatures.
- [ ] Load saved creatures.
- [ ] Add schema migration.
- [ ] Handle missing part assets safely.
- [ ] Add delete or reset behavior in parent controls later.

Dependencies: P4-05, P3-07

Verification:

- [ ] Creature survives reload.
- [ ] Corrupt creature entry is isolated.
- [ ] Old schema migration test passes.

Evidence:

```text
Not yet verified.
```

---

### P4-07 — Add critter E2E and visual tests

- [ ] Assemble a fixed creature.
- [ ] Replace one part.
- [ ] Complete animation.
- [ ] Save and reload.
- [ ] Test reduced motion.
- [ ] Capture deterministic screenshot.

Dependencies: P4-01 through P4-06

Verification:

- [ ] E2E suite passes.
- [ ] Visual baseline is stable.
- [ ] Touch viewport passes.

Evidence:

```text
Not yet verified.
```

---

## Phase 4 completion gate

- [ ] All Phase 4 tasks are complete and verified.
- [ ] No invalid creature can be produced.
- [ ] Saved creatures survive reload.
- [ ] Room is lazy-loaded and disposable.
- [ ] Phase 4 completion is recorded in the changelog.

---

# Phase 5 — Little Garden

## Goal

Implement a deterministic, positive-outcome garden simulation that teaches cause and effect.

## Exit criteria

The child can provide water and sunlight, observe growth, trigger visitors, and repeat the activity without harmful or punitive outcomes.

---

### P5-01 — Define garden simulation model

- [ ] Define water level.
- [ ] Define light level.
- [ ] Define growth stages.
- [ ] Define day and night.
- [ ] Define visitors.
- [ ] Define actions.
- [ ] Define serialization.
- [ ] Define deterministic transition rules.

Dependencies: Phase 3

Verification:

- [ ] Simulation runs without rendering.
- [ ] Same input sequence produces the same result.
- [ ] Every action has a safe outcome.

Evidence:

```text
Not yet verified.
```

---

### P5-02 — Implement garden state machine

- [ ] Add instruction.
- [ ] Add waiting.
- [ ] Add environmental effect.
- [ ] Add growth.
- [ ] Add visitor.
- [ ] Add celebration.
- [ ] Add pause and resume.
- [ ] Add recovery.
- [ ] Add repeated-tap throttling.

Dependencies: P5-01

Verification:

- [ ] State transitions are tested.
- [ ] Rapid tapping cannot skip into invalid state.
- [ ] Pause and resume preserve simulation.

Evidence:

```text
Not yet verified.
```

---

### P5-03 — Create garden scene

- [ ] Add garden bed.
- [ ] Add plant.
- [ ] Add sun.
- [ ] Add cloud or watering control.
- [ ] Add visitor character.
- [ ] Add day and night lighting.
- [ ] Add growth visuals.
- [ ] Add fallback effects.

Dependencies: P5-01

Verification:

- [ ] Scene works on target browser.
- [ ] Lighting transition respects reduced motion.
- [ ] Particle effects respect reduced effects.

Evidence:

```text
Not yet verified.
```

---

### P5-04 — Add cause-and-effect interactions

- [ ] Tap sun.
- [ ] Tap cloud.
- [ ] Optional watering-can drag.
- [ ] Show immediate response.
- [ ] Update deterministic simulation.
- [ ] Ensure excess input creates playful, safe results.
- [ ] Cancel obsolete effects.

Dependencies: P5-02, P5-03

Verification:

- [ ] Every control responds promptly.
- [ ] Repeated tapping is bounded.
- [ ] No action harms or resets the plant.

Evidence:

```text
Not yet verified.
```

---

### P5-05 — Add guided sequencing and hints

- [ ] Add one-step tasks.
- [ ] Add two-step tasks.
- [ ] Add visual hint escalation.
- [ ] Add spoken replay.
- [ ] Simplify after repeated mismatch.
- [ ] Preserve positive outcomes.

Dependencies: P5-04, Phase 3 shared systems

Verification:

- [ ] One-step and two-step flows pass.
- [ ] Incorrect sequence remains recoverable.
- [ ] Hint timers clean up.

Evidence:

```text
Not yet verified.
```

---

### P5-06 — Persist garden progress

- [ ] Save completed activities.
- [ ] Save encountered concepts.
- [ ] Save skill results.
- [ ] Avoid persisting transient animation state.
- [ ] Add migration coverage.

Dependencies: P5-05, P3-07

Verification:

- [ ] Progress survives reload.
- [ ] Storage failure remains nonfatal.

Evidence:

```text
Not yet verified.
```

---

### P5-07 — Add garden E2E and visual tests

- [ ] Complete one-step task.
- [ ] Complete two-step task.
- [ ] Test repeated tapping.
- [ ] Test pause and resume.
- [ ] Test reduced effects.
- [ ] Capture deterministic growth screenshot.

Dependencies: P5-01 through P5-06

Verification:

- [ ] E2E suite passes.
- [ ] Visual baseline is stable.
- [ ] Tablet viewport passes.

Evidence:

```text
Not yet verified.
```

---

## Phase 5 completion gate

- [ ] All Phase 5 tasks are complete and verified.
- [ ] All actions produce safe outcomes.
- [ ] Deterministic simulation is verified.
- [ ] Pause and repeated input are verified.
- [ ] Phase 5 completion is recorded in the changelog.

---

# Phase 6 — Magic Shape Factory

## Goal

Implement deterministic, automatically validated shape puzzles with forgiving drag-and-drop.

## Exit criteria

Every generated puzzle is solvable, child input is forgiving, and machine animation cannot deadlock.

---

### P6-01 — Define shape content model

- [ ] Define shape kinds.
- [ ] Define sizes.
- [ ] Define colors.
- [ ] Define item IDs.
- [ ] Define target rules.
- [ ] Define distractor rules.
- [ ] Define serialized puzzle format.

Dependencies: Phase 3

Verification:

- [ ] Model is rendering-independent.
- [ ] Definitions serialize safely.
- [ ] Invalid definitions are rejected.

Evidence:

```text
Not yet verified.
```

---

### P6-02 — Implement shape puzzle generator

- [ ] Select learning target.
- [ ] Generate correct target.
- [ ] Add distractors.
- [ ] Validate requested count.
- [ ] Reject ambiguity unless explicitly allowed.
- [ ] Add bounded regeneration.
- [ ] Record seed.

Dependencies: P6-01, P2-02

Verification:

- [ ] Property tests confirm solvability.
- [ ] No unavailable shape is requested.
- [ ] No unintended ambiguity is generated.
- [ ] Failing seeds can be reproduced.

Evidence:

```text
Not yet verified.
```

---

### P6-03 — Create factory scene

- [ ] Add input tray.
- [ ] Add conveyor.
- [ ] Add machine face.
- [ ] Add shape openings.
- [ ] Add processing sequence.
- [ ] Add output chute.
- [ ] Add large hidden drop colliders.

Dependencies: P6-01

Verification:

- [ ] Scene performs within budget.
- [ ] Drop colliders exceed visible opening sizes.
- [ ] Missing decoration has a fallback.

Evidence:

```text
Not yet verified.
```

---

### P6-04 — Implement conveyor and dragging behavior

- [ ] Add slow conveyor movement.
- [ ] Pause conveyor while dragging.
- [ ] Resume after drop.
- [ ] Handle canceled drag.
- [ ] Avoid position desynchronization.
- [ ] Add safe return animation.
- [ ] Bound repeated input.

Dependencies: P6-03, P3-05

Verification:

- [ ] Conveyor pauses during drag.
- [ ] Drag cancellation restores stable state.
- [ ] Touch emulation works.

Evidence:

```text
Not yet verified.
```

---

### P6-05 — Implement factory activity state machine

- [ ] Add instruction.
- [ ] Add waiting.
- [ ] Add evaluation.
- [ ] Add machine processing.
- [ ] Add output.
- [ ] Add hint.
- [ ] Add celebration.
- [ ] Add watchdog recovery.
- [ ] Prevent deadlock.

Dependencies: P6-02, P6-04

Verification:

- [ ] All transitions are tested.
- [ ] Processing sequence cannot execute twice.
- [ ] Watchdog restores safe state.

Evidence:

```text
Not yet verified.
```

---

### P6-06 — Add shape instructions and hints

- [ ] Add shape vocabulary.
- [ ] Add size vocabulary.
- [ ] Add color vocabulary.
- [ ] Add spoken instructions.
- [ ] Add replay.
- [ ] Add target wiggle or glow.
- [ ] Reduce choices after repeated mismatch.

Dependencies: P6-05, P3-03, P3-04

Verification:

- [ ] Muted mode remains playable.
- [ ] Hints cancel on interaction.
- [ ] Reduced motion changes animation behavior.

Evidence:

```text
Not yet verified.
```

---

### P6-07 — Persist shape progress

- [ ] Save completed activities.
- [ ] Save skill outcomes.
- [ ] Save last-played timestamp.
- [ ] Add migration coverage.

Dependencies: P6-06, P3-07

Verification:

- [ ] Progress survives reload.
- [ ] Invalid saved subsection recovers.

Evidence:

```text
Not yet verified.
```

---

### P6-08 — Add shape E2E and visual tests

- [ ] Complete fixed-seed puzzle.
- [ ] Test an incorrect drop.
- [ ] Trigger hint reduction.
- [ ] Simulate animation interruption.
- [ ] Verify recovery.
- [ ] Capture stable screenshot.

Dependencies: P6-01 through P6-07

Verification:

- [ ] E2E suite passes.
- [ ] Property tests pass.
- [ ] Visual baseline is stable.

Evidence:

```text
Not yet verified.
```

---

## Phase 6 completion gate

- [ ] All Phase 6 tasks are complete and verified.
- [ ] Generated puzzles are always solvable.
- [ ] Conveyor interaction is stable.
- [ ] Machine state cannot deadlock.
- [ ] Phase 6 completion is recorded in the changelog.

---

# Phase 7 — Musical Corner

## Goal

Implement low-latency sound matching with coordinated audio channels and accessible visual equivalents.

## Exit criteria

The child can hear, replay, and match sounds without overlapping audio or dependence on sound alone.

---

### P7-01 — Define music activity model

- [ ] Define instruments.
- [ ] Define sound IDs.
- [ ] Define target selection.
- [ ] Define choices.
- [ ] Define difficulty.
- [ ] Define serialized round format.

Dependencies: Phase 3

Verification:

- [ ] Model is serializable.
- [ ] Target always exists among choices.
- [ ] Fixed-seed output is stable.

Evidence:

```text
Not yet verified.
```

---

### P7-02 — Prepare audio assets

- [ ] Add drum sound.
- [ ] Add bell sound.
- [ ] Add xylophone sound.
- [ ] Normalize perceived loudness.
- [ ] Add supported format fallbacks.
- [ ] Record metadata.
- [ ] Verify tablet speaker clarity.

Dependencies: P7-01

Verification:

- [ ] All sounds load from base-aware paths.
- [ ] Sounds are clearly distinguishable.
- [ ] File sizes meet budget.

Evidence:

```text
Not yet verified.
```

---

### P7-03 — Create musical stage scene

- [ ] Add three instruments.
- [ ] Add stage characters or faces.
- [ ] Add pulse indicators.
- [ ] Add replay control.
- [ ] Add decorative lights.
- [ ] Add large interaction colliders.

Dependencies: P7-01

Verification:

- [ ] Instruments are visually distinct.
- [ ] Touch targets meet size guidance.
- [ ] Reduced effects mode remains clear.

Evidence:

```text
Not yet verified.
```

---

### P7-04 — Implement target sound playback

- [ ] Schedule target sound.
- [ ] Stop or duck background audio.
- [ ] Prevent instruction overlap.
- [ ] Add replay.
- [ ] Add audio-context recovery.
- [ ] Add visual pulse equivalent.

Dependencies: P7-02, P3-06

Verification:

- [ ] Target plays once.
- [ ] Replay works repeatedly.
- [ ] Suspended audio context recovers.
- [ ] Muted mode shows visual target support.

Evidence:

```text
Not yet verified.
```

---

### P7-05 — Implement instrument selection

- [ ] Play selected sound.
- [ ] Animate selected instrument.
- [ ] Evaluate match.
- [ ] Celebrate correct choice.
- [ ] Replay target after mismatch.
- [ ] Reduce choices after repeated mismatch.
- [ ] Bound rapid taps.

Dependencies: P7-03, P7-04

Verification:

- [ ] Rapid taps do not create audio overload.
- [ ] Incorrect choices remain playful.
- [ ] Correct choice completes exactly once.

Evidence:

```text
Not yet verified.
```

---

### P7-06 — Add additional sound concepts

- [ ] Add loud versus soft.
- [ ] Add high versus low.
- [ ] Keep difficulty appropriate for age.
- [ ] Add visual equivalents.
- [ ] Keep activity generation deterministic.

Dependencies: P7-05

Verification:

- [ ] Concepts are distinguishable on target hardware.
- [ ] Muted fallback remains understandable.
- [ ] Generation tests pass.

Evidence:

```text
Not yet verified.
```

---

### P7-07 — Persist musical progress

- [ ] Save completed rounds.
- [ ] Save skill outcomes.
- [ ] Save last-played timestamp.
- [ ] Add migration coverage.

Dependencies: P7-06, P3-07

Verification:

- [ ] Progress survives reload.
- [ ] Storage failure is nonfatal.

Evidence:

```text
Not yet verified.
```

---

### P7-08 — Add music E2E and audio tests

- [ ] Play target.
- [ ] Replay target.
- [ ] Choose incorrect instrument.
- [ ] Choose correct instrument.
- [ ] Test rapid taps.
- [ ] Test mute.
- [ ] Test audio resume.
- [ ] Capture stable visual screenshot.

Dependencies: P7-01 through P7-07

Verification:

- [ ] E2E suite passes.
- [ ] Audio coordination tests pass.
- [ ] Tablet manual sound check is recorded.

Evidence:

```text
Not yet verified.
```

---

## Phase 7 completion gate

- [ ] All Phase 7 tasks are complete and verified.
- [ ] Audio overlap rules are verified.
- [ ] Replay and recovery are verified.
- [ ] Visual equivalents are present.
- [ ] Phase 7 completion is recorded in the changelog.

---

# Phase 8 — Parent Controls and Accessibility

## Goal

Add local parent controls, persistent accessibility settings, and safe data-management tools.

## Exit criteria

An adult can configure the game and inspect local progress without exposing child-facing complexity or negative assessment language.

---

### P8-01 — Implement parent gate

- [ ] Add accidental-access deterrent.
- [ ] Use adult-readable instructions.
- [ ] Add keyboard access.
- [ ] Add cancel behavior.
- [ ] Avoid presenting the gate as security.

Dependencies: Phase 1

Verification:

- [ ] Child is unlikely to open it accidentally.
- [ ] Adult can enter with keyboard and pointer.
- [ ] Gate cannot trap the user.

Evidence:

```text
Not yet verified.
```

---

### P8-02 — Implement settings model

- [ ] Master volume.
- [ ] Music toggle or volume.
- [ ] Speech volume.
- [ ] Reduced motion.
- [ ] Reduced effects.
- [ ] High-contrast interaction outlines.
- [ ] Hint delay.
- [ ] Enabled rooms.
- [ ] Enabled learning categories.

Dependencies: P3-07

Verification:

- [ ] Settings persist.
- [ ] Invalid values fall back safely.
- [ ] Every room consumes relevant settings.

Evidence:

```text
Not yet verified.
```

---

### P8-03 — Implement settings UI

- [ ] Use accessible native controls.
- [ ] Add visible focus.
- [ ] Add labels.
- [ ] Add immediate preview where useful.
- [ ] Add Back or Close.
- [ ] Avoid child-like ambiguity in adult settings.

Dependencies: P8-02

Verification:

- [ ] Keyboard navigation works.
- [ ] Screen-reader names are present.
- [ ] Touch targets are adequate.

Evidence:

```text
Not yet verified.
```

---

### P8-04 — Apply reduced motion globally

- [ ] Startup transition.
- [ ] Playroom camera transitions.
- [ ] Train celebration.
- [ ] Critter reactions.
- [ ] Garden lighting and growth.
- [ ] Shape machine.
- [ ] Musical stage.
- [ ] Idle hints.

Dependencies: P8-02, Phases 1–7

Verification:

- [ ] Each room has a documented reduced-motion behavior.
- [ ] No critical educational animation is removed.
- [ ] E2E reduced-motion path passes.

Evidence:

```text
Not yet verified.
```

---

### P8-05 — Apply reduced effects globally

- [ ] Reduce particles.
- [ ] Reduce flashes.
- [ ] Reduce decorative motion.
- [ ] Preserve essential feedback.
- [ ] Apply setting without reload where practical.

Dependencies: P8-02, Phases 1–7

Verification:

- [ ] All rooms respond to the setting.
- [ ] Core success feedback remains understandable.

Evidence:

```text
Not yet verified.
```

---

### P8-06 — Add local progress summary

- [ ] Show recently played rooms.
- [ ] Show activity completion counts.
- [ ] Show encountered concepts.
- [ ] Show saved creatures.
- [ ] Avoid ranking or negative assessment language.
- [ ] Make clear that this is not a diagnosis.

Dependencies: Phases 2, 4, 5, 6, 7

Verification:

- [ ] Summary reflects saved data accurately.
- [ ] Empty state is friendly.
- [ ] No personal information is shown or requested.

Evidence:

```text
Not yet verified.
```

---

### P8-07 — Add reset and deletion controls

- [ ] Reset learning progress.
- [ ] Delete saved creatures.
- [ ] Reset settings.
- [ ] Reset all local data.
- [ ] Add deliberate confirmation.
- [ ] Recover cleanly after reset.

Dependencies: P8-03, P8-06

Verification:

- [ ] Each reset scope affects only intended data.
- [ ] Full reset returns to safe defaults.
- [ ] Destructive action cannot be triggered accidentally.

Evidence:

```text
Not yet verified.
```

---

### P8-08 — Accessibility audit

- [ ] Global keyboard navigation.
- [ ] Visible focus.
- [ ] Accessible names.
- [ ] Color is not the only signal.
- [ ] Important audio has visual equivalents.
- [ ] Target sizes meet guidance.
- [ ] Reduced-motion behavior is complete.
- [ ] Canvas-adjacent DOM controls are usable.

Dependencies: P8-01 through P8-07

Verification:

- [ ] Automated accessibility checks pass where applicable.
- [ ] Manual keyboard audit is recorded.
- [ ] Manual color-dependence review is recorded.

Evidence:

```text
Not yet verified.
```

---

## Phase 8 completion gate

- [ ] All Phase 8 tasks are complete and verified.
- [ ] Settings persist and affect every room.
- [ ] Parent controls are accessible.
- [ ] Reset behavior is safe.
- [ ] Accessibility audit is complete.
- [ ] Phase 8 completion is recorded in the changelog.

---

# Phase 9 — Offline Support and Performance

## Goal

Make the production application installable where supported, usable offline after initial loading, and stable on target devices.

## Exit criteria

The app works without a network after a successful first load, remains functional if service-worker installation fails, and meets agreed performance budgets.

---

### P9-01 — Add web app manifest

- [ ] Add name and short name.
- [ ] Add icons.
- [ ] Add theme and background colors.
- [ ] Add display mode.
- [ ] Make manifest path base-aware.
- [ ] Validate manifest.

Dependencies: Phase 0

Verification:

- [ ] Manifest loads under GitHub Pages subpath.
- [ ] Icons resolve.
- [ ] Browser recognizes installability prerequisites where supported.

Evidence:

```text
Not yet verified.
```

---

### P9-02 — Add service worker

- [ ] Cache hashed application assets.
- [ ] Cache critical startup assets.
- [ ] Add room-asset strategy.
- [ ] Avoid caching failed responses.
- [ ] Handle version updates.
- [ ] Avoid interrupting active play.
- [ ] Add failure recovery.
- [ ] Ensure base-path correctness.

Dependencies: P9-01, Phases 1–7

Verification:

- [ ] Initial online load works.
- [ ] Subsequent offline load works.
- [ ] Failed install does not break online use.
- [ ] New version activates safely.

Evidence:

```text
Not yet verified.
```

---

### P9-03 — Add offline tests

- [ ] Load online.
- [ ] Wait for service-worker readiness.
- [ ] Reload offline.
- [ ] Enter each cached room.
- [ ] Verify saved progress.
- [ ] Simulate partial asset-cache failure.
- [ ] Verify friendly recovery.

Dependencies: P9-02

Verification:

- [ ] Offline E2E suite passes.
- [ ] GitHub Pages preview path passes offline test.

Evidence:

```text
Not yet verified.
```

---

### P9-04 — Add adaptive quality

- [ ] Define low, medium, and high quality.
- [ ] Adjust pixel ratio.
- [ ] Adjust shadows.
- [ ] Adjust particles.
- [ ] Adjust decorative objects.
- [ ] Keep game logic identical.
- [ ] Allow diagnostics override.

Dependencies: Phases 1–7

Verification:

- [ ] Quality changes do not affect correctness.
- [ ] Low mode improves frame stability.
- [ ] Setting persists only if intentionally exposed.

Evidence:

```text
Not yet verified.
```

---

### P9-05 — Add performance diagnostics

- [ ] Track frame time.
- [ ] Track room load time.
- [ ] Track draw calls where practical.
- [ ] Track memory indicators where practical.
- [ ] Keep data local and bounded.
- [ ] Expose in diagnostics only.

Dependencies: P0-10, P9-04

Verification:

- [ ] Diagnostics do not materially reduce performance.
- [ ] Metrics reset correctly.
- [ ] No personal data is recorded.

Evidence:

```text
Not yet verified.
```

---

### P9-06 — Enforce bundle and asset budgets

- [ ] Report initial bundle size.
- [ ] Report per-room chunks.
- [ ] Report major asset sizes.
- [ ] Add warning thresholds.
- [ ] Document justified exceptions.
- [ ] Remove accidental duplicate assets.

Dependencies: Phases 1–7

Verification:

- [ ] Build report is generated.
- [ ] Initial critical bundle meets target or exception is documented.
- [ ] Rooms remain lazy-loaded.

Evidence:

```text
Not yet verified.
```

---

### P9-07 — Profile and optimize rooms

- [ ] Playroom.
- [ ] Train.
- [ ] Critter.
- [ ] Garden.
- [ ] Shapes.
- [ ] Music.
- [ ] Room exit cleanup.
- [ ] Long-session memory behavior.

Dependencies: P9-04, P9-05, P9-06

Verification:

- [ ] Stable 60 FPS on capable hardware.
- [ ] Stable 30 FPS minimum on agreed lower-end device.
- [ ] No significant memory growth after repeated room entry and exit.

Evidence:

```text
Not yet verified.
```

---

## Phase 9 completion gate

- [ ] All Phase 9 tasks are complete and verified.
- [ ] Offline mode works after initial load.
- [ ] Service-worker failure is nonfatal.
- [ ] Performance budgets are recorded.
- [ ] Target device tests are recorded.
- [ ] Phase 9 completion is recorded in the changelog.

---

# Phase 10 — Release Hardening

## Goal

Audit and verify the entire product for correctness, privacy, accessibility, recoverability, performance, and repeatable deployment.

## Exit criteria

All release criteria are satisfied with recorded evidence, and no known critical child-facing dead end remains.

---

### P10-01 — Full end-to-end suite

- [ ] Startup.
- [ ] Audio initialization.
- [ ] Enter and exit all rooms.
- [ ] Complete one activity in every room.
- [ ] Reload persistence.
- [ ] Apply settings.
- [ ] Reset data.
- [ ] Test reduced motion.
- [ ] Test offline mode.
- [ ] Test repository subpath.
- [ ] Test tablet viewport.

Dependencies: Phases 0–9

Verification:

- [ ] Full E2E suite passes locally.
- [ ] Full E2E suite passes in CI.

Evidence:

```text
Not yet verified.
```

---

### P10-02 — Error recovery audit

- [ ] Startup asset failure.
- [ ] Room asset failure.
- [ ] Audio rejection.
- [ ] Storage rejection.
- [ ] Corrupt save data.
- [ ] Animation timeout.
- [ ] Pointer cancellation.
- [ ] Visibility change.
- [ ] WebGL initialization failure.
- [ ] Service-worker failure.

Dependencies: Phases 0–9

Verification:

- [ ] Every tested failure has a child-safe path.
- [ ] No raw technical error is shown.
- [ ] Home or Retry is available where needed.

Evidence:

```text
Not yet verified.
```

---

### P10-03 — Privacy audit

- [ ] No remote analytics.
- [ ] No tracking scripts.
- [ ] No personal-data fields.
- [ ] No device fingerprinting.
- [ ] No remote speech processing.
- [ ] No microphone or camera use.
- [ ] No unapproved remote resources.
- [ ] Local diagnostics are bounded and clearable.

Dependencies: Phases 0–9

Verification:

- [ ] Network inspection shows only intended static asset requests.
- [ ] Production bundle contains no analytics SDK.
- [ ] Save data contains no personal data.

Evidence:

```text
Not yet verified.
```

---

### P10-04 — Accessibility release audit

- [ ] Keyboard global navigation.
- [ ] Visible focus.
- [ ] Accessible labels.
- [ ] Target sizes.
- [ ] Reduced motion.
- [ ] Reduced effects.
- [ ] Visual equivalents for important audio.
- [ ] Color-independent cues.
- [ ] Parent controls accessibility.

Dependencies: Phase 8

Verification:

- [ ] Automated checks pass.
- [ ] Manual audit notes are attached or linked.
- [ ] Known limitations are documented.

Evidence:

```text
Not yet verified.
```

---

### P10-05 — Performance release audit

- [ ] Initial load.
- [ ] Room load times.
- [ ] Frame stability.
- [ ] Memory cleanup.
- [ ] Bundle sizes.
- [ ] Asset sizes.
- [ ] Long-session behavior.
- [ ] Low-quality mode.

Dependencies: Phase 9

Verification:

- [ ] Performance report is recorded.
- [ ] Critical regressions are resolved.
- [ ] Any accepted exceptions are documented.

Evidence:

```text
Not yet verified.
```

---

### P10-06 — Dependency and security audit

- [ ] Review dependency licenses.
- [ ] Review dependency maintenance.
- [ ] Remove unused dependencies.
- [ ] Check for known vulnerabilities.
- [ ] Confirm no runtime secret use.
- [ ] Confirm no unsafe HTML injection.
- [ ] Confirm no runtime code loading.

Dependencies: Phases 0–9

Verification:

- [ ] Audit command output is recorded.
- [ ] High-severity issues are resolved or explicitly accepted by a human maintainer.

Evidence:

```text
Not yet verified.
```

---

### P10-07 — Documentation audit

- [ ] README is current.
- [ ] Setup commands are current.
- [ ] Deployment steps are current.
- [ ] Architecture notes are current.
- [ ] ADRs are present.
- [ ] Save schema is documented.
- [ ] Test commands are documented.
- [ ] Asset conventions are documented.
- [ ] This implementation plan is current.

Dependencies: Phases 0–9

Verification:

- [ ] A new developer can build and deploy using documentation only.
- [ ] No documented command is stale.

Evidence:

```text
Not yet verified.
```

---

### P10-08 — Final GitHub Pages deployment verification

This release operation is performed only when explicitly requested by a human maintainer. It does not block completion or commits for Phases 0–9.

- [ ] Clean install.
- [ ] Full validation.
- [ ] Production build.
- [ ] Deploy.
- [ ] Load live site.
- [ ] Complete one activity.
- [ ] Reload.
- [ ] Verify asset paths.
- [ ] Verify service worker.
- [ ] Verify offline relaunch.

Dependencies: P10-01 through P10-07

Verification:

- [ ] Live deployment URL is recorded.
- [ ] Live smoke test is complete.
- [ ] No console errors occur during the smoke test.

Evidence:

```text
Not yet verified.
```

---

## Phase 10 completion gate

- [ ] All Phase 10 tasks are complete and verified.
- [ ] All global release-readiness items are checked.
- [ ] No unresolved critical blocker remains.
- [ ] Release version is recorded.
- [ ] Final deployment is recorded in the changelog.

---

# 4. Cross-Cutting Backlog

Use this section for tasks discovered during implementation that do not belong in the active task.

Do not silently expand the current scope. Add a backlog item with a unique ID.

| ID | Status | Description | Discovered in | Priority | Notes |
|---|---|---|---|---|---|
| B-001 | [N/A] | Placeholder removed; no cross-cutting backlog item has been discovered. | Phase 0 | Low | N/A |

---

# 5. Blockers

Record active blockers here.

| ID | Status | Blocking task | Description | Needed resolution | Owner |
|---|---|---|---|---|---|
| BL-001 | [x] | None | Resolved by policy: live deployment is not an implementation-phase gate. | Local repository-subpath preview is the required phase evidence. | Codex |
| BL-002 | [x] | None | Resolved by maintainer approval to generate interim high-quality voice assets at build time. Five Ava neural TTS lines are bundled as ten local OGG/MP3 files with no runtime speech service. | Replace through the stable audio keys if human recordings are supplied later; replacement is not a phase blocker. | Codex |

When a blocker is resolved:

1. Update the affected task.
2. Record the resolution.
3. Move relevant information to the changelog.
4. Remove or mark the blocker resolved.

---

# 6. Verification Record

Use this section for milestone-level validation summaries.

## Phase 0 verification

```text
Status: Complete
Date: 2026-07-18
Commit: f5beca9
Commands: npm run format:check; npm run lint; npm run typecheck; npm run test; npm run test:coverage; npm run build; npm run build:pages; npm run test:e2e; PLAYWRIGHT_ROOT=1 npm run test:e2e -- --project=desktop-chromium; npm run dev -- --host 127.0.0.1; git diff --check
Manual checks: Vite dev server reached ready state; production output inspected as static HTML/CSS/JS; desktop and tablet Chromium loaded the repository subpath; retained failure artifacts inspected.
Known limitations: Live deployment is intentionally outside the implementation-phase verification policy.
```

## Phase 1 verification

```text
Status: Complete
Date: 2026-07-18
Commit: Phase 1 startup and playroom shell commit (this commit)
Commands: npm run format:check; npm run lint; npm run typecheck; npm run test; npm run test:coverage; npm run build:pages; npm run test:e2e -- --reporter=line; temporary desktop Chromium frame-stability probe; git diff --check
Manual checks: Desktop and touch-enabled tablet Chromium started the app, rendered five portals, entered the train room, replayed, returned Home, used keyboard settings, and exercised reduced motion. Production chunks were inspected for startup/playroom/room separation.
Known limitations: Room activities are intentional placeholders until their planned phases; live deployment is outside the implementation-phase policy.
```

## Phase 2 verification

```text
Status: Complete
Date: 2026-07-18
Commit: Phase 2 Tiny Delivery Train commit (this commit)
Commands: npm run format:check; npm run lint; npm run typecheck; npm run test (33 passed); npm run test:coverage; npm run build; npm run build:pages; npm run test:e2e; npm run test:e2e -- --grep "two-yellow-duck" --update-snapshots --reporter=line; npm run test:e2e -- --grep "two-yellow-duck" --reporter=line; npm run preview:pages; git diff --check
Manual checks: Desktop and tablet Chromium rejected a distractor, dragged a yellow duck, loaded two ducks, requested instruction/count/success audio in order, celebrated, reloaded, and restored Trips: 1. Both fixed-seed screenshot baselines passed on a clean rerun; all ten audio files were decoded and inspected for codec, sample rate, channel count, duration, and size.
Known limitations: The approved neural TTS is an interim creative asset and can be replaced by human recordings through the same stable cue names. The shared R3F runtime retains its documented size warning.
```

## Phase 3 verification

```text
Status: Complete
Date: 2026-07-18
Commit: Phase 3 shared activity framework commit (this commit)
Commands: npm run format:check; npm run lint; npm run typecheck; npm run test (50 passed); npm run test:coverage; npm run build; npm run build:pages; npm run test:e2e -- --reporter=line; git diff --check
Manual checks: The desktop/tablet fixed train scenario retained its visual baselines, drag behavior, ordered local audio, celebration, reload, and root-schema progress. Lazy train and placeholder modules exercised preload/session start/disposal under the Pages subpath.
Known limitations: Audio intentionally permits one active voice for clarity. Shared primitives cover proven train and placeholder needs; later rooms may extend policies without weakening the current contracts.
```

## Phase 4 verification

```text
Status: Not started
Date:
Commit:
Commands:
Manual checks:
Known limitations:
```

## Phase 5 verification

```text
Status: Not started
Date:
Commit:
Commands:
Manual checks:
Known limitations:
```

## Phase 6 verification

```text
Status: Not started
Date:
Commit:
Commands:
Manual checks:
Known limitations:
```

## Phase 7 verification

```text
Status: Not started
Date:
Commit:
Commands:
Manual checks:
Known limitations:
```

## Phase 8 verification

```text
Status: Not started
Date:
Commit:
Commands:
Manual checks:
Known limitations:
```

## Phase 9 verification

```text
Status: Not started
Date:
Commit:
Commands:
Manual checks:
Known limitations:
```

## Phase 10 verification

```text
Status: Not started
Date:
Commit:
Commands:
Manual checks:
Known limitations:
```

---

# 7. Decision Log

Record implementation decisions that affect future work but do not require a full ADR, or link the relevant ADR.

| Date | Decision | Reason | ADR |
|---|---|---|---|
| YYYY-MM-DD | Initial implementation plan created. | Establish phase tracking and verification discipline. | N/A |
| 2026-07-18 | Use configurable Vite base paths and internal application navigation. | Preserve root development, GitHub Pages subpath deployment, and static hosting. | ADR-001 |
| 2026-07-18 | Use local Pages-subpath validation for implementation phases and commit every completed phase separately. | Deployment infrastructure is a release concern and must not block implementation progress. | N/A |

---

# 8. Change Log

Every agent session that changes implementation status should add an entry.

## Entry template

```markdown
### YYYY-MM-DD — <short session title>

**Agent or developer:**  
**Commit or branch:**  

**Completed:**
- Task IDs

**In progress:**
- Task IDs

**Verified:**
- Commands and manual checks

**Blocked:**
- Blocker IDs or “None”

**Notes:**
- Important decisions, limitations, or context for the next session
```

---

### Initial entry — Plan created

**Agent or developer:** OpenAI assistant  
**Commit or branch:** Not yet committed

**Completed:**
- Created the initial multi-phase implementation plan.

**In progress:**
- None

**Verified:**
- Markdown file generated successfully.

**Blocked:**
- None

**Notes:**
- No implementation tasks have been marked complete.
- The first coding task should be `P0-01`.

### 2026-07-18 — Phase 0 repository foundation

**Agent or developer:** Codex
**Commit or branch:** `f5beca9`

**Completed:**
- P0-01 through P0-06
- P0-09 and P0-10
- P0-07 and P0-08

**In progress:**
- None

**Verified:**
- `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, and `npm run build:pages` passed.
- `npm run test:e2e -- --reporter=line` passed 4/4 desktop and tablet Chromium tests under `/carlys-magic-playroom/`.
- A temporary broken unit assertion exited 1; the probe was removed and the full suite passed again.
- The Vite development server reached ready state at `/`.

**Blocked:**
- None

**Notes:**
- Live deployment is intentionally deferred to an explicitly requested release operation and does not block Phase 1.
- The production build contains only static HTML, CSS, and JavaScript and requires no runtime server.

### 2026-07-18 — Phase 1 startup and playroom shell

**Agent or developer:** Codex
**Commit or branch:** Phase 1 commit (this commit)

**Completed:**
- P1-01 through P1-07

**In progress:**
- None

**Verified:**
- Formatting, lint, strict typecheck, 17 unit/component tests, coverage, and the Pages production build passed.
- Desktop and touch-enabled tablet Chromium passed 8/8 startup, navigation, settings, reduced-motion, room, replay, and Home checks.
- A temporary desktop Chromium frame probe confirmed the 95th-percentile animation interval remained below 40ms; the probe was removed after verification.
- Build output contains a 205.59kB startup chunk, a Play-gated Three.js chunk, and five independent lazy room chunks.

**Blocked:**
- None

**Notes:**
- ADR-002 records the guarded reducer, gesture-safe audio, Play-gated 3D scene, and lazy room lifecycle decisions.
- Each room remains a friendly placeholder until its planned implementation phase.

### 2026-07-18 — Phase 2 Tiny Delivery Train

**Agent or developer:** Codex
**Commit or branch:** `f89c14a`

**Completed:**
- P2-01 through P2-12

**In progress:**
- None

**Verified:**
- Strict typecheck, lint, 33 unit/component tests, and the repository-subpath production build passed.
- Generator properties passed across 300 seeds and all difficulty levels.
- Desktop and tablet Chromium passed fixed-seed train completion, drag, ordered audio, celebration, screenshot, and reload-persistence checks.

**Blocked:**
- None

**Notes:**
- The maintainer approved build-time neural TTS. `public/audio/train/README.md` records the voice, generation parameters, processing, lines, and formats.
- ADR-003 records local bundled speech, serialized playback, and stable replacement keys; no runtime TTS or network service was added.

### 2026-07-18 — Phase 3 shared activity framework

**Agent or developer:** Codex
**Commit or branch:** Phase 3 commit (this commit)

**Completed:**
- P3-01 through P3-08

**In progress:**
- None

**Verified:**
- Formatting, lint, strict typecheck, 50 unit/integration tests, coverage, root/Pages builds, and desktop/tablet Playwright regression passed.
- The train migrated to shared lifecycle, state, instruction, hint, pointer, audio, root persistence, and deterministic test primitives without changing its child-facing flow.
- Placeholder rooms provide independent consumers of the lazy room module/session contract.

**Blocked:**
- None

**Notes:**
- ADR-004 records the post-train extraction boundary and IndexedDB v2 root migration.
- Shared abstractions remain domain-neutral; curriculum rules and render decisions stay inside each room.
