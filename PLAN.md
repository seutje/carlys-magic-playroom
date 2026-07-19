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
- [x] Phase 4 — Build-a-Critter Lab
- [x] Phase 5 — Little Garden
- [x] Phase 6 — Magic Shape Factory
- [x] Phase 7 — Musical Corner
- [x] Phase 8 — Parent Controls and Accessibility
- [x] Phase 9 — Offline Support and Performance
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
Verified 2026-07-18 with the base-aware, offline-cached locomotive, cargo-car, and duck GLBs at desktop and tablet viewports. The room shares immutable duck geometry while cloning and disposing per-instance materials for curriculum colors, preserves oversized invisible drag colliders and primitive fallbacks, and owns all source-model GPU cleanup. The train room is 21.45kB minified; the lazy GLTF loader is 44.27kB and the three reported GLB assets total 944,708 bytes.
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

- [x] Define bodies.
- [x] Define socket IDs.
- [x] Define compatible parts.
- [x] Define colors and patterns.
- [x] Define reactions.
- [x] Define serialized saved creature format.
- [x] Define versioning.

Dependencies: Phase 3

Verification:

- [x] Model is serializable.
- [x] Socket IDs are exhaustive.
- [x] Invalid part compatibility is rejected.

Evidence:

```text
Verified 2026-07-18 by `critterModel.test.ts`. Two bodies, three exhaustive sockets, seven compatible parts, three colors/patterns/reactions, and schema-1 saves validate after JSON; incompatible and cross-socket parts are rejected.
```

---

### P4-02 — Implement critter assembly rules

- [x] Add one active body.
- [x] Add eye placement.
- [x] Add mouth placement.
- [x] Add leg placement.
- [x] Add part replacement.
- [x] Add automatic snapping.
- [x] Prevent invalid creature state.
- [x] Ensure every selection produces a valid creature.

Dependencies: P4-01

Verification:

- [x] All allowed combinations assemble.
- [x] Replacement works.
- [x] Invalid socket combinations fail safely.
- [x] No alignment precision is required.

Evidence:

```text
Verified 2026-07-18 across every declared body/part compatibility. Typed selections snap by socket ID, replace atomically, remove incompatibilities on body changes, and lock assembly during celebration.
```

---

### P4-03 — Create critter lab scene

- [x] Add assembly platform.
- [x] Add part trays.
- [x] Add attachment indicators.
- [x] Add preview or mirror area.
- [x] Add celebration stage.
- [x] Add large interaction targets.

Dependencies: P4-01

Verification:

- [x] Scene performs within budget.
- [x] Missing decorative assets do not break assembly.
- [x] Targets work with touch.

Evidence:

```text
Verified 2026-07-18 with nine base-aware, offline-cached GLBs covering both bodies and every eye, mouth, and leg choice. The scene shares immutable source geometry, clones and disposes visible-instance materials for curriculum body colors, and retains per-component primitives as immediate load-failure fallbacks. Initial and completed desktop/tablet baselines cover every component family, the platform, trays, socket steps, mirror, and 64px-class DOM targets. The critter chunk is 15.05kB minified; its nine GLBs total 566,824 bytes, keeping all project models at 1,511,532 bytes against the 2MB budget.
```

---

### P4-04 — Add guided assembly flow

- [x] Introduce one category at a time.
- [x] Name each body part aloud.
- [x] Add visual demonstration.
- [x] Add replay.
- [x] Add hint escalation.
- [x] Allow free replacement before completion.

Dependencies: P4-02, P4-03, Phase 3 shared systems

Verification:

- [x] Child can complete without reading.
- [x] Repeated selections remain safe.
- [x] Audio does not overlap incorrectly.

Evidence:

```text
Verified 2026-07-18 by unit and E2E flows. Eyes, mouth, and legs appear in sequence with symbols, demonstrations, visual socket progress, serialized Ava voice cues, Replay interruption, escalating outlines, and access to earlier filled categories for replacement.
```

---

### P4-05 — Add critter animation and reactions

- [x] Add completed-creature reveal.
- [x] Add at least three reactions.
- [x] Add tap-to-react.
- [x] Add reduced-motion alternatives.
- [x] Add fallback animation behavior.

Dependencies: P4-04

Verification:

- [x] Reactions do not overlap incorrectly.
- [x] Rapid taps are bounded.
- [x] Reduced motion remains engaging.

Evidence:

```text
Verified 2026-07-18 by reduced-motion desktop/tablet E2E and guarded reaction state. Wave, bounce, and sparkle share one owned reaction window; rapid taps are ignored until cleanup, while reduced motion substitutes static sparkles and a short reveal.
```

---

### P4-06 — Persist saved creatures

- [x] Save completed creatures.
- [x] Load saved creatures.
- [x] Add schema migration.
- [x] Handle missing part assets safely.
- [N/A] Add delete or reset behavior in parent controls later.

Dependencies: P4-05, P3-07

Verification:

- [x] Creature survives reload.
- [x] Corrupt creature entry is isolated.
- [x] Old schema migration test passes.

Evidence:

```text
Verified 2026-07-18 by `critterPersistence.test.ts` and E2E reload. Root-save entries deduplicate, corrupt creatures are filtered independently, compatible schema-0 saves migrate, and stable part IDs resolve independent GLBs with built-in primitive recovery. Parent reset remains correctly scheduled for Phase 8.
```

---

### P4-07 — Add critter E2E and visual tests

- [x] Assemble a fixed creature.
- [x] Replace one part.
- [x] Complete animation.
- [x] Save and reload.
- [x] Test reduced motion.
- [x] Capture deterministic screenshot.

Dependencies: P4-01 through P4-06

Verification:

- [x] E2E suite passes.
- [x] Visual baseline is stable.
- [x] Touch viewport passes.

Evidence:

```text
Verified 2026-07-18 in desktop/tablet Chromium under the repository subpath. The fixed flow replaces GLB eye components, completes GLB mouth/legs, requests all four voice cues in order, bounds reaction taps, reloads one saved creature, survives complete component-asset loss, and matches per-viewport baselines.
```

---

## Phase 4 completion gate

- [x] All Phase 4 tasks are complete and verified.
- [x] No invalid creature can be produced.
- [x] Saved creatures survive reload.
- [x] Room is lazy-loaded and disposable.
- [x] Phase 4 completion is recorded in the changelog.

---

# Phase 5 — Little Garden

## Goal

Implement a deterministic, positive-outcome garden simulation that teaches cause and effect.

## Exit criteria

The child can provide water and sunlight, observe growth, trigger visitors, and repeat the activity without harmful or punitive outcomes.

---

### P5-01 — Define garden simulation model

- [x] Define water level.
- [x] Define light level.
- [x] Define growth stages.
- [x] Define day and night.
- [x] Define visitors.
- [x] Define actions.
- [x] Define serialization.
- [x] Define deterministic transition rules.

Dependencies: Phase 3

Verification:

- [x] Simulation runs without rendering.
- [x] Same input sequence produces the same result.
- [x] Every action has a safe outcome.

Evidence:

```text
Verified 2026-07-18 by `gardenSimulation.test.ts`. Seeded one/two-step definitions survive JSON, identical event sequences reproduce water/light/growth/time/visitors, and every helper monotonically adds a bounded positive resource.
```

---

### P5-02 — Implement garden state machine

- [x] Add instruction.
- [x] Add waiting.
- [x] Add environmental effect.
- [x] Add growth.
- [x] Add visitor.
- [x] Add celebration.
- [x] Add pause and resume.
- [x] Add recovery.
- [x] Add repeated-tap throttling.

Dependencies: P5-01

Verification:

- [x] State transitions are tested.
- [x] Rapid tapping cannot skip into invalid state.
- [x] Pause and resume preserve simulation.

Evidence:

```text
Verified 2026-07-18 by pure reducer tests and E2E double-dispatch. The evaluating phase admits one action, owned timers advance effects/watchdogs, stable waiting can pause/resume, and recovery never reduces the garden.
```

---

### P5-03 — Create garden scene

- [x] Add garden bed.
- [x] Add plant.
- [x] Add sun.
- [x] Add cloud or watering control.
- [x] Add visitor character.
- [x] Add day and night lighting.
- [x] Add growth visuals.
- [x] Add fallback effects.

Dependencies: P5-01

Verification:

- [x] Scene works on target browser.
- [x] Lighting transition respects reduced motion.
- [x] Particle effects respect reduced effects.

Evidence:

```text
Verified 2026-07-19 by desktop/tablet Chromium baselines. Seven independently loaded, happy-faced Blender GLBs cover seed, sprout, bud, flower, sun, cloud, and a playful bee at the second growth step, while local primitive fallbacks preserve growth during partial or complete asset loss. The bee was rebuilt from scratch without decimation or limbs: its sun-like face, antennae, striped body, and two wings retain 1,672 triangles in five material batches and total 149,036 bytes. All garden models total 244,988 bytes, the garden chunk is 12.66kB minified, and all project models use 2,103,596 bytes against the maintainer-authorized 4MB model budget. Bee/ladybug visitors, day/night lighting, and WebGL recovery remain rendering-independent; reduced motion removes lighting transitions and rain particles.
```

---

### P5-04 — Add cause-and-effect interactions

- [x] Tap sun.
- [x] Tap cloud.
- [N/A] Optional watering-can drag.
- [x] Show immediate response.
- [x] Update deterministic simulation.
- [x] Ensure excess input creates playful, safe results.
- [x] Cancel obsolete effects.

Dependencies: P5-02, P5-03

Verification:

- [x] Every control responds promptly.
- [x] Repeated tapping is bounded.
- [x] No action harms or resets the plant.

Evidence:

```text
Verified 2026-07-18 by immediate DOM feedback, pure transition tests, and a browser double-click dispatch. Sun/rain always increase a clamped resource, mismatches keep growth, and phase/room changes cancel obsolete owned effects.
```

---

### P5-05 — Add guided sequencing and hints

- [x] Add one-step tasks.
- [x] Add two-step tasks.
- [x] Add visual hint escalation.
- [x] Add spoken replay.
- [x] Simplify after repeated mismatch.
- [x] Preserve positive outcomes.

Dependencies: P5-04, Phase 3 shared systems

Verification:

- [x] One-step and two-step flows pass.
- [x] Incorrect sequence remains recoverable.
- [x] Hint timers clean up.

Evidence:

```text
Verified 2026-07-18 by unit and E2E flows. Named water/sun guidance uses local serialized speech and Replay interruption; outlines escalate, two mismatches leave only the requested helper enabled, and every alternate action stays positive.
```

---

### P5-06 — Persist garden progress

- [x] Save completed activities.
- [x] Save encountered concepts.
- [x] Save skill results.
- [x] Avoid persisting transient animation state.
- [x] Add migration coverage.

Dependencies: P5-05, P3-07

Verification:

- [x] Progress survives reload.
- [x] Storage failure remains nonfatal.

Evidence:

```text
Verified 2026-07-18 by `gardenPersistence.test.ts` and E2E reload. Root progress stores only totals/concepts/skills/bounded IDs, migrates schema 0, validates corrupt fields, writes idempotently, and catches blocked storage locally.
```

---

### P5-07 — Add garden E2E and visual tests

- [x] Complete one-step task.
- [x] Complete two-step task.
- [x] Test repeated tapping.
- [x] Test pause and resume.
- [x] Test reduced effects.
- [x] Capture deterministic growth screenshot.

Dependencies: P5-01 through P5-06

Verification:

- [x] E2E suite passes.
- [x] Visual baseline is stable.
- [x] Tablet viewport passes.

Evidence:

```text
Verified 2026-07-19 in desktop/tablet Chromium under the repository subpath. The fixed flow pauses/resumes, double-dispatches a helper safely, completes one then two steps, requests all three cue assets, reloads two games, survives complete garden-model loss, and matches deterministic happy-character growth and second-step bee baselines.
```

---

## Phase 5 completion gate

- [x] All Phase 5 tasks are complete and verified.
- [x] All actions produce safe outcomes.
- [x] Deterministic simulation is verified.
- [x] Pause and repeated input are verified.
- [x] Phase 5 completion is recorded in the changelog.

---

# Phase 6 — Magic Shape Factory

## Goal

Implement deterministic, automatically validated shape puzzles with forgiving drag-and-drop.

## Exit criteria

Every generated puzzle is solvable, child input is forgiving, and machine animation cannot deadlock.

---

### P6-01 — Define shape content model

- [x] Define shape kinds.
- [x] Define sizes.
- [x] Define colors.
- [x] Define item IDs.
- [x] Define target rules.
- [x] Define distractor rules.
- [x] Define serialized puzzle format.

Dependencies: Phase 3

Verification:

- [x] Model is rendering-independent.
- [x] Definitions serialize safely.
- [x] Invalid definitions are rejected.

Evidence:

```text
Verified 2026-07-18 by `shapeFactory.test.ts`. The rendering-independent schema uses closed shape/size/color unions, stable item IDs, one explicit target rule, JSON-safe data, and rejects malformed, duplicate, or ambiguous definitions.
```

---

### P6-02 — Implement shape puzzle generator

- [x] Select learning target.
- [x] Generate correct target.
- [x] Add distractors.
- [x] Validate requested count.
- [x] Reject ambiguity unless explicitly allowed.
- [x] Add bounded regeneration.
- [x] Record seed.

Dependencies: P6-01, P2-02

Verification:

- [x] Property tests confirm solvability.
- [x] No unavailable shape is requested.
- [x] No unintended ambiguity is generated.
- [x] Failing seeds can be reproduced.

Evidence:

```text
Verified 2026-07-18 across 250 deterministic property seeds. Each bounded generation records its seed, draws only available vocabulary, emits one achievable target plus three distinct distractors, and reproduces exactly.
```

---

### P6-03 — Create factory scene

- [x] Add input tray.
- [x] Add conveyor.
- [x] Add machine face.
- [x] Add shape openings.
- [x] Add processing sequence.
- [x] Add output chute.
- [x] Add large hidden drop colliders.

Dependencies: P6-01

Verification:

- [x] Scene performs within budget.
- [x] Drop colliders exceed visible opening sizes.
- [x] Missing decoration has a fallback.

Evidence:

```text
Verified 2026-07-18 in desktop/tablet Chromium and production builds. Shared low-poly primitives render the tray, conveyor, friendly machine, opening, processing light, chute/output, enlarged DOM drop target, and child-safe WebGL fallback.
```

---

### P6-04 — Implement conveyor and dragging behavior

- [x] Add slow conveyor movement.
- [x] Pause conveyor while dragging.
- [x] Resume after drop.
- [x] Handle canceled drag.
- [x] Avoid position desynchronization.
- [x] Add safe return animation.
- [x] Bound repeated input.

Dependencies: P6-03, P3-05

Verification:

- [x] Conveyor pauses during drag.
- [x] Drag cancellation restores stable state.
- [x] Touch emulation works.

Evidence:

```text
Verified 2026-07-18 by reducer and desktop/tablet pointer-drag tests. Pointer capture pauses the conveyor, the generous opening accepts near drops, cancel/outside paths restore stable waiting, and locked phases bound repeated input without render-position authority.
```

---

### P6-05 — Implement factory activity state machine

- [x] Add instruction.
- [x] Add waiting.
- [x] Add evaluation.
- [x] Add machine processing.
- [x] Add output.
- [x] Add hint.
- [x] Add celebration.
- [x] Add watchdog recovery.
- [x] Prevent deadlock.

Dependencies: P6-02, P6-04

Verification:

- [x] All transitions are tested.
- [x] Processing sequence cannot execute twice.
- [x] Watchdog restores safe state.

Evidence:

```text
Verified 2026-07-18 by exhaustive reducer flow tests. Typed instruction/waiting/processing/output/hint/celebration transitions are idempotent; duplicate processing is ignored, and owned processing/output watchdogs advance or explicit recovery returns to waiting.
```

---

### P6-06 — Add shape instructions and hints

- [x] Add shape vocabulary.
- [x] Add size vocabulary.
- [x] Add color vocabulary.
- [x] Add spoken instructions.
- [x] Add replay.
- [x] Add target wiggle or glow.
- [x] Reduce choices after repeated mismatch.

Dependencies: P6-05, P3-03, P3-04

Verification:

- [x] Muted mode remains playable.
- [x] Hints cancel on interaction.
- [x] Reduced motion changes animation behavior.

Evidence:

```text
Verified 2026-07-18 by local Ava instruction/success assets, DOM vocabulary and target glyphs, Replay, glow escalation, and two-mismatch choice reduction. Muted play retains exact visual guidance and reduced motion shortens/removes conveyor and processing movement.
```

---

### P6-07 — Persist shape progress

- [x] Save completed activities.
- [x] Save skill outcomes.
- [x] Save last-played timestamp.
- [x] Add migration coverage.

Dependencies: P6-06, P3-07

Verification:

- [x] Progress survives reload.
- [x] Invalid saved subsection recovers.

Evidence:

```text
Verified 2026-07-18 by `shapePersistence.test.ts` and E2E reload. Root progress stores bounded totals, attempts/successes, completion IDs, and ISO last-played time; schema 0 migrates and invalid fields recover independently.
```

---

### P6-08 — Add shape E2E and visual tests

- [x] Complete fixed-seed puzzle.
- [x] Test an incorrect drop.
- [x] Trigger hint reduction.
- [x] Simulate animation interruption.
- [x] Verify recovery.
- [x] Capture stable screenshot.

Dependencies: P6-01 through P6-07

Verification:

- [x] E2E suite passes.
- [x] Property tests pass.
- [x] Visual baseline is stable.

Evidence:

```text
Verified 2026-07-18 by 67 unit/integration tests and the fixed desktop/tablet Pages-path flow. Two wrong choices reduce the tray, a real pointer drag pauses the conveyor and completes through watchdog-owned processing, progress reloads, recovery is unit-tested, and per-viewport screenshots are stable.
```

---

## Phase 6 completion gate

- [x] All Phase 6 tasks are complete and verified.
- [x] Generated puzzles are always solvable.
- [x] Conveyor interaction is stable.
- [x] Machine state cannot deadlock.
- [x] Phase 6 completion is recorded in the changelog.

---

# Phase 7 — Musical Corner

## Goal

Implement low-latency sound matching with coordinated audio channels and accessible visual equivalents.

## Exit criteria

The child can hear, replay, and match sounds without overlapping audio or dependence on sound alone.

---

### P7-01 — Define music activity model

- [x] Define instruments.
- [x] Define sound IDs.
- [x] Define target selection.
- [x] Define choices.
- [x] Define difficulty.
- [x] Define serialized round format.

Dependencies: Phase 3

Verification:

- [x] Model is serializable.
- [x] Target always exists among choices.
- [x] Fixed-seed output is stable.

Evidence:

```text
Verified 2026-07-18 by `musicActivity.test.ts`. Versioned rendering-independent rounds reproduce from fixed seeds, cover three difficulty concepts, keep stable IDs, and validate that the target exists exactly once among distinct choices.
```

---

### P7-02 — Prepare audio assets

- [x] Add drum sound.
- [x] Add bell sound.
- [x] Add xylophone sound.
- [x] Normalize perceived loudness.
- [x] Add supported format fallbacks.
- [x] Record metadata.
- [x] Verify tablet speaker clarity.

Dependencies: P7-01

Verification:

- [x] All sounds load from base-aware paths.
- [x] Sounds are clearly distinguishable.
- [x] File sizes meet budget.

Evidence:

```text
Verified 2026-07-18. Seven 48 kHz mono cues provide OGG/MP3 fallbacks, additive timbres, -18 LUFS normal targets, intentional -14/-28 LUFS volume contrast, base-aware URLs, 0.85–1.45 second duration, and files under 9 KB. The maintainer confirmed clarity on the intended physical tablet speakers.
```

---

### P7-03 — Create musical stage scene

- [x] Add three instruments.
- [x] Add stage characters or faces.
- [x] Add pulse indicators.
- [x] Add replay control.
- [x] Add decorative lights.
- [x] Add large interaction colliders.

Dependencies: P7-01

Verification:

- [x] Instruments are visually distinct.
- [x] Touch targets meet size guidance.
- [x] Reduced effects mode remains clear.

Evidence:

```text
Verified 2026-07-18 by desktop/tablet Chromium baselines. Independently loaded Blender drum, bell, and xylophone GLBs preserve stage lights, target pulse, exact visual patterns, replay, and 80+ CSS-pixel DOM choices, while per-instrument primitive fallbacks keep the stage playable during partial or complete model loss. Reused Blender geometry keeps the three assets to 347,076 bytes; the music chunk is 10.83kB minified and all project models total 1,858,608 bytes against the 2MB budget.
```

---

### P7-04 — Implement target sound playback

- [x] Schedule target sound.
- [x] Stop or duck background audio.
- [x] Prevent instruction overlap.
- [x] Add replay.
- [x] Add audio-context recovery.
- [x] Add visual pulse equivalent.

Dependencies: P7-02, P3-06

Verification:

- [x] Target plays once.
- [x] Replay works repeatedly.
- [x] Suspended audio context recovers.
- [x] Muted mode shows visual target support.

Evidence:

```text
Verified 2026-07-18 by `musicAudio.test.ts` and E2E Replay/mute flows. Educational targets interrupt stale sound, resume the shared audio context, replay repeatedly, stay one-voice coordinated, and always expose an equivalent target picture.
```

---

### P7-05 — Implement instrument selection

- [x] Play selected sound.
- [x] Animate selected instrument.
- [x] Evaluate match.
- [x] Celebrate correct choice.
- [x] Replay target after mismatch.
- [x] Reduce choices after repeated mismatch.
- [x] Bound rapid taps.

Dependencies: P7-03, P7-04

Verification:

- [x] Rapid taps do not create audio overload.
- [x] Incorrect choices remain playful.
- [x] Correct choice completes exactly once.

Evidence:

```text
Verified 2026-07-18 by pure reducer and E2E flows. Selection plays its cue, evaluating disables all choices immediately, mismatch replays the target, two mismatches reduce to one picture, correct completion is idempotent, and a 180 ms controller gate bounds audio requests.
```

---

### P7-06 — Add additional sound concepts

- [x] Add loud versus soft.
- [x] Add high versus low.
- [x] Keep difficulty appropriate for age.
- [x] Add visual equivalents.
- [x] Keep activity generation deterministic.

Dependencies: P7-05

Verification:

- [x] Concepts are distinguishable on target hardware.
- [x] Muted fallback remains understandable.
- [x] Generation tests pass.

Evidence:

```text
Verified 2026-07-18. Seeded difficulty two uses bell cues separated by over an octave; difficulty three uses a 14 LU drum contrast; both have up/down and big/small visual patterns and muted fallback. The maintainer confirmed target-hardware distinguishability.
```

---

### P7-07 — Persist musical progress

- [x] Save completed rounds.
- [x] Save skill outcomes.
- [x] Save last-played timestamp.
- [x] Add migration coverage.

Dependencies: P7-06, P3-07

Verification:

- [x] Progress survives reload.
- [x] Storage failure is nonfatal.

Evidence:

```text
Verified 2026-07-18 by `musicPersistence.test.ts` and E2E reload. Root progress stores bounded totals, concepts, attempts/successes, completion IDs, and ISO last-played time; schema 0 migrates and storage corruption/failure recovers nonfatally.
```

---

### P7-08 — Add music E2E and audio tests

- [x] Play target.
- [x] Replay target.
- [x] Choose incorrect instrument.
- [x] Choose correct instrument.
- [x] Test rapid taps.
- [x] Test mute.
- [x] Test audio resume.
- [x] Capture stable visual screenshot.

Dependencies: P7-01 through P7-07

Verification:

- [x] E2E suite passes.
- [x] Audio coordination tests pass.
- [x] Tablet manual sound check is recorded.

Evidence:

```text
Verified 2026-07-18 with unit/integration coverage and the desktop/tablet Pages-path flow. Target/replay, mute, rapid replay, selection locking, two mismatches, choice reduction, correct match, audio requests, persistence, complete GLB loss recovery, and stable screenshots pass. The maintainer recorded the required physical tablet listening approval.
```

---

## Phase 7 completion gate

- [x] All Phase 7 tasks are complete and verified.
- [x] Audio overlap rules are verified.
- [x] Replay and recovery are verified.
- [x] Visual equivalents are present.
- [x] Phase 7 completion is recorded in the changelog.

---

# Phase 8 — Parent Controls and Accessibility

## Goal

Add local parent controls, persistent accessibility settings, and safe data-management tools.

## Exit criteria

An adult can configure the game and inspect local progress without exposing child-facing complexity or negative assessment language.

---

### P8-01 — Implement parent gate

- [x] Add accidental-access deterrent.
- [x] Use adult-readable instructions.
- [x] Add keyboard access.
- [x] Add cancel behavior.
- [x] Avoid presenting the gate as security.

Dependencies: Phase 1

Verification:

- [x] Child is unlikely to open it accidentally.
- [x] Adult can enter with keyboard and pointer.
- [x] Gate cannot trap the user.

Evidence:

```text
Owned hold timers, pointer cancellation, keyboard entry, Escape/Back, and focus restoration are covered by ParentGate integration tests and desktop/tablet Playwright.
```

---

### P8-02 — Implement settings model

- [x] Master volume.
- [x] Music toggle or volume.
- [x] Speech volume.
- [x] Reduced motion.
- [x] Reduced effects.
- [x] High-contrast interaction outlines.
- [x] Hint delay.
- [x] Enabled rooms.
- [x] Enabled learning categories.

Dependencies: P3-07

Verification:

- [x] Settings persist.
- [x] Invalid values fall back safely.
- [x] Every room consumes relevant settings.

Evidence:

```text
Persisted settings are validated with safe defaults; channel volumes, hint timing, room/category availability, motion, effects, and contrast are consumed by the app and rooms.
```

---

### P8-03 — Implement settings UI

- [x] Use accessible native controls.
- [x] Add visible focus.
- [x] Add labels.
- [x] Add immediate preview where useful.
- [x] Add Back or Close.
- [x] Avoid child-like ambiguity in adult settings.

Dependencies: P8-02

Verification:

- [x] Keyboard navigation works.
- [x] Screen-reader names are present.
- [x] Touch targets are adequate.

Evidence:

```text
Native labeled controls, visible focus, immediate previews, 44px minimum adult targets, keyboard operation, and responsive desktop/tablet screenshots were verified.
```

---

### P8-04 — Apply reduced motion globally

- [x] Startup transition.
- [x] Playroom camera transitions.
- [x] Train celebration.
- [x] Critter reactions.
- [x] Garden lighting and growth.
- [x] Shape machine.
- [x] Musical stage.
- [x] Idle hints.

Dependencies: P8-02, Phases 1–7

Verification:

- [x] Each room has a documented reduced-motion behavior.
- [x] No critical educational animation is removed.
- [x] E2E reduced-motion path passes.

Evidence:

```text
Persisted and system motion preferences cover startup/playroom transitions, all five rooms, celebrations, reactions, growth, stage effects, and hints without removing instructional state.
```

---

### P8-05 — Apply reduced effects globally

- [x] Reduce particles.
- [x] Reduce flashes.
- [x] Reduce decorative motion.
- [x] Preserve essential feedback.
- [x] Apply setting without reload where practical.

Dependencies: P8-02, Phases 1–7

Verification:

- [x] All rooms respond to the setting.
- [x] Core success feedback remains understandable.

Evidence:

```text
A global reduced-effects class plus room hooks suppress decorative particles, flashes, and motion immediately while retaining text, state, and success feedback.
```

---

### P8-06 — Add local progress summary

- [x] Show recently played rooms.
- [x] Show activity completion counts.
- [x] Show encountered concepts.
- [x] Show saved creatures.
- [x] Avoid ranking or negative assessment language.
- [x] Make clear that this is not a diagnosis.

Dependencies: Phases 2, 4, 5, 6, 7

Verification:

- [x] Summary reflects saved data accurately.
- [x] Empty state is friendly.
- [x] No personal information is shown or requested.

Evidence:

```text
The parent summary reads validated local migrations/completions/concepts/creatures, presents a friendly empty state, and explicitly avoids diagnosis and personal information.
```

---

### P8-07 — Add reset and deletion controls

- [x] Reset learning progress.
- [x] Delete saved creatures.
- [x] Reset settings.
- [x] Reset all local data.
- [x] Add deliberate confirmation.
- [x] Recover cleanly after reset.

Dependencies: P8-03, P8-06

Verification:

- [x] Each reset scope affects only intended data.
- [x] Full reset returns to safe defaults.
- [x] Destructive action cannot be triggered accidentally.

Evidence:

```text
Integration tests verify isolated progress, creature, settings, and all-data resets; Playwright covers cancel plus confirmed full reset and restoration of safe defaults.
```

---

### P8-08 — Accessibility audit

- [x] Global keyboard navigation.
- [x] Visible focus.
- [x] Accessible names.
- [x] Color is not the only signal.
- [x] Important audio has visual equivalents.
- [x] Target sizes meet guidance.
- [x] Reduced-motion behavior is complete.
- [x] Canvas-adjacent DOM controls are usable.

Dependencies: P8-01 through P8-07

Verification:

- [x] Automated accessibility checks pass where applicable.
- [x] Manual keyboard audit is recorded.
- [x] Manual color-dependence review is recorded.

Evidence:

```text
80 unit/integration tests, native control semantics, keyboard/focus E2E, desktop/tablet screenshots, and manual color/visual review cover the Phase 8 audit.
```

---

## Phase 8 completion gate

- [x] All Phase 8 tasks are complete and verified.
- [x] Settings persist and affect every room.
- [x] Parent controls are accessible.
- [x] Reset behavior is safe.
- [x] Accessibility audit is complete.
- [x] Phase 8 completion is recorded in the changelog.

---

# Phase 9 — Offline Support and Performance

## Goal

Make the production application installable where supported, usable offline after initial loading, and stable on target devices.

## Exit criteria

The app works without a network after a successful first load, remains functional if service-worker installation fails, and meets agreed performance budgets.

---

### P9-01 — Add web app manifest

- [x] Add name and short name.
- [x] Add icons.
- [x] Add theme and background colors.
- [x] Add display mode.
- [x] Make manifest path base-aware.
- [x] Validate manifest.

Dependencies: Phase 0

Verification:

- [x] Manifest loads under GitHub Pages subpath.
- [x] Icons resolve.
- [x] Browser recognizes installability prerequisites where supported.

Evidence:

```text
The generated manifest has base-aware scope/start/icon URLs, local 192/512 PNG icons, and zero Chromium Page.getAppManifest errors in both browser profiles.
```

---

### P9-02 — Add service worker

- [x] Cache hashed application assets.
- [x] Cache critical startup assets.
- [x] Add room-asset strategy.
- [x] Avoid caching failed responses.
- [x] Handle version updates.
- [x] Avoid interrupting active play.
- [x] Add failure recovery.
- [x] Ensure base-path correctness.

Dependencies: P9-01, Phases 1–7

Verification:

- [x] Initial online load works.
- [x] Subsequent offline load works.
- [x] Failed install does not break online use.
- [x] New version activates safely.

Evidence:

```text
The versioned worker precaches successful hashed/startup/room/audio assets, uses safe cache-first/network-first strategies, waits through active play, and treats registration or partial cache failure as nonfatal.
```

---

### P9-03 — Add offline tests

- [x] Load online.
- [x] Wait for service-worker readiness.
- [x] Reload offline.
- [x] Enter each cached room.
- [x] Verify saved progress.
- [x] Simulate partial asset-cache failure.
- [x] Verify friendly recovery.

Dependencies: P9-02

Verification:

- [x] Offline E2E suite passes.
- [x] GitHub Pages preview path passes offline test.

Evidence:

```text
Desktop/tablet Pages-subpath E2E activates the worker, completes/persists Train online, reloads offline, enters all five rooms, removes Music audio from Cache Storage, and retains visual recovery.
```

---

### P9-04 — Add adaptive quality

- [x] Define low, medium, and high quality.
- [x] Adjust pixel ratio.
- [x] Adjust shadows.
- [x] Adjust particles.
- [x] Adjust decorative objects.
- [x] Keep game logic identical.
- [x] Allow diagnostics override.

Dependencies: Phases 1–7

Verification:

- [x] Quality changes do not affect correctness.
- [x] Low mode improves frame stability.
- [x] Setting persists only if intentionally exposed.

Evidence:

```text
Pure selection tests cover all profiles and diagnostics-only overrides; every canvas consumes common DPR/shadow/antialias/effect/decoration limits while reducers and persisted settings remain unchanged.
```

---

### P9-05 — Add performance diagnostics

- [x] Track frame time.
- [x] Track room load time.
- [x] Track draw calls where practical.
- [x] Track memory indicators where practical.
- [x] Keep data local and bounded.
- [x] Expose in diagnostics only.

Dependencies: P0-10, P9-04

Verification:

- [x] Diagnostics do not materially reduce performance.
- [x] Metrics reset correctly.
- [x] No personal data is recorded.

Evidence:

```text
Thirty-frame sampling records six bounded scene summaries, 20 room loads, draw calls, and optional heap locally; unit/E2E tests cover invalid input, reset, diagnostics-only visibility, and low sampling overhead.
```

---

### P9-06 — Enforce bundle and asset budgets

- [x] Report initial bundle size.
- [x] Report per-room chunks.
- [x] Report major asset sizes.
- [x] Add warning thresholds.
- [x] Document justified exceptions.
- [x] Remove accidental duplicate assets.

Dependencies: Phases 1–7

Verification:

- [x] Build report is generated.
- [x] Initial critical bundle meets target or exception is documented.
- [x] Rooms remain lazy-loaded.

Evidence:

```text
Each build emits bundle-report.json: Pages initial 239,408 B raw/71,708 B gzip, rooms 8,969–17,699 B, audio 420,606 B, no duplicates, and an 881,362 B lazy shared-3D exception below its 900 KB cap.
```

---

### P9-07 — Profile and optimize rooms

- [x] Playroom.
- [x] Train.
- [x] Critter.
- [x] Garden.
- [x] Shapes.
- [x] Music.
- [x] Room exit cleanup.
- [x] Long-session memory behavior.

Dependencies: P9-04, P9-05, P9-06

Verification:

- [x] Stable 60 FPS on capable hardware.
- [x] Stable 30 FPS minimum on agreed lower-end device.
- [x] No significant memory growth after repeated room entry and exit.

Evidence:

```text
Serial desktop/tablet profiling enters/exits all rooms twice with one canvas, <25 MB post-GC growth, <=18.5 ms capable-desktop and <=34 ms tablet-profile frame budgets. The maintainer approved physical-tablet smoothness and interaction.
```

---

## Phase 9 completion gate

- [x] All Phase 9 tasks are complete and verified.
- [x] Offline mode works after initial load.
- [x] Service-worker failure is nonfatal.
- [x] Performance budgets are recorded.
- [x] Target device tests are recorded.
- [x] Phase 9 completion is recorded in the changelog.

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
Status: Complete
Date: 2026-07-18
Commit: Phase 4 Build-a-Critter Lab commit (this commit)
Commands: npm run format:check; npm run lint; npm run typecheck; npm run test (56 passed); npm run test:coverage; npm run build; npm run build:pages; npm run test:e2e -- --grep "fixed critter" --update-snapshots --reporter=line; npm run test:e2e -- --reporter=line; git diff --check
Manual checks: Desktop and touch-tablet Chromium assembled and replaced a fixed creature, matched reduced-motion visual baselines, requested eyes/mouth/legs/ready speech in order, bounded rapid reaction taps, reloaded one saved creature, and retained the train regression. Eight critter audio files were decoded and inspected for format, sample rate, channels, duration, and size.
Known limitations: The approved Ava neural TTS remains replaceable interim voice artwork. Complete local data deletion is intentionally delivered with the Phase 8 parent controls.
```

## Phase 5 verification

```text
Status: Complete
Date: 2026-07-19
Commit: Phase 5 Little Garden commit (this commit)
Commands: npm run format:check; npm run lint; npm run typecheck; npm run test (107 passed); npm run test:coverage; npm run build; npm run build:pages; npm run test:e2e -- --grep "garden tasks" --update-snapshots=all --reporter=line (2 passed); npm run test:e2e -- --workers=2 --reporter=line (34 passed); npm run test:performance (4 passed); git diff --check
Manual checks: Desktop and tablet Chromium paused/resumed, safely double-clicked a helper, completed one- and two-step tasks, requested cloud/sun/success assets, displayed deterministic growth/day-night/visitor states, reloaded two completions, and matched reduced-effects growth and bee screenshots. The isolated Blender viewport and both in-game baselines were inspected for the bee's scale, two antennae, sun-like eyes/smile/cheeks, intact striped body, two wings, and intentionally limb-free silhouette.
Known limitations: The approved neural voice remains replaceable interim artwork. Reduced-effects currently follows reduced-motion until Phase 8 exposes its independent parent setting.
```

## Phase 6 verification

```text
Status: Complete
Date: 2026-07-18
Commit: Phase 6 Magic Shape Factory commit (this commit)
Commands: npm run format:check; npm run lint; npm run typecheck; npm run test (67 passed); npm run test:coverage; npm run build; npm run build:pages; npm run test:e2e -- --grep "shape factory" --update-snapshots=all --reporter=line; npm run test:e2e -- --reporter=line; git diff --check
Manual checks: Desktop and touch-tablet Chromium reduced choices after two safe mismatches, completed with a real pointer drag while the conveyor paused, advanced through watchdog-owned processing, requested instruction/success audio, persisted/reloaded progress, and matched per-viewport baselines. Four audio files were decoded and inspected.
Known limitations: The approved Ava neural TTS remains replaceable interim voice artwork. Child-facing curriculum stays on the reviewed small-red-square target until additional matching local prompts are approved; the generator itself supports the full vocabulary.
```

## Phase 7 verification

```text
Status: Complete
Date: 2026-07-18
Commit: Phase 7 Musical Corner commit (this commit)
Commands: npm run format:check; npm run lint; npm run typecheck; npm run test (74 passed); npm run test:coverage; npm run build; npm run build:pages; npm run test:e2e -- --grep "musical target" --update-snapshots=all --reporter=line; npm run test:e2e -- --reporter=line (18 passed); git diff --check
Manual checks: Desktop and touch-tablet Chromium replayed, muted, retained exact visual targets, disabled choices during evaluation, reduced after mismatches, completed, persisted/reloaded, requested distinct local cues, and matched per-viewport baselines. Fourteen encoded audio files were decoded and inspected for format, sample rate, channels, duration, size, and designed frequency/loudness separation.
Known limitations: The local synthesized cues are interim audio artwork and may be replaced later without changing their stable sound IDs.
```

## Phase 8 verification

```text
Status: Complete
Date: 2026-07-18
Commit: Phase 8 Parent Controls and Accessibility commit (this commit)
Commands: npm run format:check; npm run lint; npm run typecheck; npm run test (80 passed); npm run test:coverage; npm run build; npm run build:pages; npm run test:e2e -- --grep "parent controls" --reporter=line (2 passed); npm run test:e2e -- --reporter=line (20 passed); git diff --check
Manual checks: Desktop and touch-tablet Chromium verified the cancellable keyboard/pointer parent gate, focus restoration, responsive controls, immediate high-contrast and room-availability previews, persistence after reload, friendly empty summary, and cancel/confirm reset flows. Screenshot review confirmed readable layouts, visible control states, and no color-only meaning.
Known limitations: The parent gate intentionally deters accidental access but is not a security boundary. The existing shared React Three Fiber production chunk remains 881 kB and is tracked by Phase 9 performance work.
```

## Phase 9 verification

```text
Status: Complete
Date: 2026-07-18
Commit: Phase 9 Offline Support and Performance commit (this commit)
Commands: npm run format:check; npm run lint; npm run typecheck; npm run test (87 passed); npm run test:coverage; npm run build; npm run build:pages; npm run test:e2e -- --reporter=line (26 passed); npm run test:performance (4 passed); git diff --check
Manual checks: Generated 192/512 icons were inspected for correct dimensions; desktop/tablet Chromium validated manifest install prerequisites, offline startup and all rooms, partial Music cache loss, diagnostics-only quality, repeated cleanup, frame/draw-call sampling, and post-GC heap bounds. The maintainer approved smoothness and interaction on the intended physical tablet.
Known limitations: The lazy shared 3D runtime is a documented 881,362-byte exception capped at 900 KB.
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
**Commit or branch:** `01310c1`

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

### 2026-07-18 — Phase 4 Build-a-Critter Lab

**Agent or developer:** Codex
**Commit or branch:** `58ffb17`

**Completed:**
- P4-01 through P4-07

**In progress:**
- None

**Verified:**
- Formatting, lint, strict typecheck, 56 unit/integration tests, coverage, root/Pages builds, and desktop/tablet Playwright passed.
- Every declared compatible part attaches by socket ID; incompatible and corrupt combinations fail safely.
- The fixed reduced-motion E2E flow replaces a part, completes, reacts, persists, reloads, and matches stable per-viewport screenshots.

**Blocked:**
- None

**Notes:**
- ADR-005 records valid-by-construction assembly and stable saved-part identifiers.
- Four guided lines use the approved build-time Ava voice in OGG/MP3 with no runtime TTS or network dependency.

### 2026-07-18 — Phase 5 Little Garden

**Agent or developer:** Codex
**Commit or branch:** `62ba8dc`

**Completed:**
- P5-01 through P5-07

**In progress:**
- None

**Verified:**
- Formatting, lint, strict typecheck, 61 unit/integration tests, coverage, root/Pages builds, and desktop/tablet Playwright passed.
- Pure fixed-sequence tests prove deterministic monotonic growth and bounded rapid input.
- The fixed reduced-effects E2E flow pauses, completes one/two steps, persists, reloads, and matches per-viewport growth baselines.

**Blocked:**
- None

**Notes:**
- ADR-006 records deterministic positive-outcome simulation and transient-state persistence boundaries.
- Three guided lines use approved bundled Ava OGG/MP3 assets; no runtime speech/network dependency was added.


### 2026-07-18 — Phase 6 Magic Shape Factory

**Agent or developer:** Codex
**Commit or branch:** Phase 6 commit (this commit)

**Completed:**
- P6-01 through P6-08

**In progress:**
- None

**Verified:**
- Formatting, lint, strict typecheck, 67 unit/integration tests, coverage, root/Pages builds, and desktop/tablet Playwright passed.
- Property coverage proves one unambiguous solution across 250 seeds; reducer tests cover cancellation, duplicate processing, hints, and recovery.
- The fixed reduced-motion E2E flow performs two safe mismatches, reduces choices, pauses during a real drag, completes, persists, reloads, and matches per-viewport baselines.

**Blocked:**
- None

**Notes:**
- ADR-007 records the deterministic puzzle/render adapter boundary and watchdog-owned processing sequence.
- Two guided lines use approved bundled Ava OGG/MP3 assets; no runtime speech or network dependency was added.

### 2026-07-19 — Four-step Magic Shape Factory expansion

**Agent or developer:** Codex

**Completed:**
- Expanded one factory activity from one insertion to four automatically advancing steps.
- Assigned the red square, blue circle, yellow triangle, and green diamond to four stable machine slots.
- Kept hints step-local and persisted completion only after the fourth successful insertion.

**Verified:**
- Deterministic definition/reducer tests cover four unique target/slot pairs and full-sequence completion.
- Desktop and tablet reduced-motion E2E flows complete all four steps under the Pages base path.
- Updated visual baselines show one four-slot machine face with 80 CSS-pixel minimum targets.

**Blocked:**
- None.

**Notes:**
- ADR-007 and the bundled shape-audio README document the sequence and four matching local prompts.
- The three added Ava prompts were generated with the approved build-time workflow, then bundled as
  trimmed, normalized 48 kHz mono OGG/MP3 pairs; runtime remains fully local and offline.


### 2026-07-18 — Phase 7 Musical Corner

**Agent or developer:** Codex
**Commit or branch:** Phase 7 commit (this commit)

**Completed:**
- P7-01 through P7-08

**In progress:**
- None

**Verified:**
- Deterministic instrument/pitch/volume generation, state transitions, one-voice coordination, resume, mute, throttling, and persistence pass automated tests.
- Desktop and touch-tablet Chromium complete the fixed flow and match stable visual baselines.
- All 14 encoded cues decode at 48 kHz mono, remain under 9 KB each, and meet their designed duration/frequency/loudness targets.

**Blocked:**
- None

**Notes:**
- ADR-008 records local synthesis, visual equivalents, and why emulation cannot substitute for the physical listening gate.
- The maintainer confirmed all required cues are clear on the intended physical tablet speakers on 2026-07-18.

### 2026-07-18 — Phase 8 Parent Controls and Accessibility

**Agent or developer:** Codex
**Commit or branch:** Phase 8 commit (this commit)

**Completed:**
- P8-01 through P8-08

**In progress:**
- None

**Verified:**
- Formatting, lint, strict typecheck, 80 unit/integration tests, coverage, root/Pages builds, and 20 desktop/tablet Playwright tests passed.
- Parent settings persist with validated recovery and immediately affect audio, motion, effects, contrast, hints, rooms, and learning categories.
- Keyboard/focus behavior, native control labels, responsive screenshots, neutral summaries, and isolated/full reset scopes were audited.

**Blocked:**
- None

**Notes:**
- ADR-009 records the session-only accidental-access gate, optimistic local settings provider, and scoped reset ownership.
- The gate explicitly states that it is not a security lock; progress explicitly states that it is not a diagnosis or formal assessment.

### 2026-07-18 — Phase 9 Offline Support and Performance

**Agent or developer:** Codex
**Commit or branch:** Phase 9 commit (this commit)

**Completed:**
- P9-01 through P9-07

**In progress:**
- None

**Verified:**
- Formatting, lint, strict typecheck, 87 unit/integration tests, coverage, root/Pages builds, 26 desktop/tablet E2E tests, and four serial performance profiles pass.
- Both browser profiles install the base-aware manifest/worker, reload offline, enter all five cached rooms, retain progress, and recover visually after Music audio cache deletion.
- Enforced budgets report a 239,408-byte Pages initial bundle, 8,969–17,699-byte room chunks, 420,606 bytes of audio, no duplicates, and the bounded lazy 3D exception.
- The maintainer approved frame stability and touch interaction on the intended physical tablet.

**Blocked:**
- None

**Notes:**
- ADR-010 records the partial-failure-tolerant versioned offline shell and safe update lifecycle.
- ADR-011 records non-persisted adaptive quality, bounded local performance metrics, and why the physical device gate remains necessary.
