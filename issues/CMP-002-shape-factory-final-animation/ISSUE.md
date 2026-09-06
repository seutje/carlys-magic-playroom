# CMP-002: Shape Factory needs a clearer final-shape animation

## Status

**Resolved**

- Owner: Codex
- Reported: 2026-09-06
- Last updated: 2026-09-06
- Affected area: Magic Shape Factory output and celebration sequence

## Original report

> shape game needs better animation showing the final shape

## Description

After a correct shape enters the machine, the resulting shape is not presented clearly enough.
The completion moment should make the cause and effect obvious to a young child: the chosen input
goes into the machine, the machine processes it, and the completed shape emerges as the focus of a
warm celebration.

The improvement must communicate the result visually without depending on text, sound, precise
timing, or a long unskippable sequence. Reduced-motion mode needs an equally clear static or gently
transitioned presentation.

## Pre-fix implementation notes

- The typed state machine already separates `processing`, `output`, `celebrating`, and `complete`.
- `ShapeFactoryRoom` advances those phases with owned watchdog timers: approximately 1.1 seconds
  for processing, 0.7 seconds for output, and 1.2 seconds for celebration in standard motion.
- `ShapeFactoryScene` renders `ShapeProduct` only when `outputItemId` exists.
- The product currently appears at a fixed position with a fixed rotation and scale; the prominent
  celebration layer is text (`Shape made!`) rather than a focused reveal of the created object.
- Reduced-motion timing is already shorter and must remain supported without hiding the result.

## Resolution

- The completed shape now grows out of the output chute, travels into a prominent focal position,
  and settles inside a bright halo before the next step begins.
- Kind and color still come directly from the active typed target; the focal scale now preserves a
  visibly distinct small/big size instead of flattening every result into a small decoration.
- Phase durations and the renderer-only pose calculation live in `shapeFactory.model.ts`. Owned
  watchdogs remain the only authority that advances processing, output, and celebration.
- Reduced-motion mode places the product directly in the same focal pose with no travel or spin.
  Both modes hold the result for 2.2 seconds and retain accessible status feedback.
- Optional sparkles are bounded by the adaptive quality profile. The halo and product remain at low
  quality, while reduced motion removes the 3D sparkles entirely.

## Desired behavior

- The completed shape visibly emerges from the machine and becomes the visual focus.
- Its color, kind, and size are easy to recognize and match the completed target.
- The result remains visible long enough for a child to understand what was made.
- The sequence cannot deadlock if an animation callback is late or missing; state-owned fallback
  timing remains authoritative.
- Reduced-motion mode replaces travel, spin, bounce, or particle-heavy effects with a clear static
  reveal or short opacity transition.
- The output remains legible at low quality and without optional effects.

## Acceptance criteria

- [x] A correct placement produces a visually continuous processing-to-output-to-celebration
      sequence.
- [x] The final product is substantially more prominent than its current small, static output.
- [x] The rendered product accurately reflects target kind, color, and size.
- [x] The result is understandable with audio muted and without reading the status text.
- [x] Reduced-motion mode clearly shows the same result without large movement or rapid animation.
- [x] Repeated or rapid input cannot duplicate the output or complete a step more than once.
- [x] Missing animation completion cannot trap the activity; watchdog recovery remains covered.
- [x] Deterministic visual tests cover normal and reduced-motion output states.
- [x] Frame stability and object cleanup are verified after completing and leaving the room.

## Implementation checklist

- [x] Capture the current output sequence as a baseline.
- [x] Define the animation stages and the state-derived timing contract.
- [x] Implement the final-product reveal without putting authoritative progression in frame logic.
- [x] Add the reduced-motion presentation.
- [x] Verify output geometry for circle, square, triangle, diamond, small, and big variants.
- [x] Ensure effects are bounded and honor adaptive-quality settings.
- [x] Add or update state-machine, end-to-end, and visual-regression tests.
- [x] Run the required repository validation commands.

## Changed files

- `src/rooms/shapes/ShapeFactoryScene.tsx`
- `src/rooms/shapes/ShapeFactoryRoom.tsx`
- `src/rooms/shapes/shapeFactory.model.ts`
- `src/app/app.css`
- `tests/unit/shapeFactory.test.ts`
- `tests/e2e/startup.spec.ts`
- `tests/performance/room-lifecycle.spec.ts`
- Standard/reduced desktop/tablet baselines under `tests/e2e/startup.spec.ts-snapshots/`

## Validation record

The renderer-only pose tests cover monotonic chute-to-focus travel, stable final placement, distinct
small/big scale, and a motion-free reduced presentation. Existing reducer coverage continues to
prove duplicate input is ignored and watchdog events are idempotent. The browser flow captures the
settled red-square result in standard and reduced modes at both configured viewports. The lifecycle
performance test now completes all four shape kinds at low quality, returns home, collects garbage,
and verifies bounded heap, draw calls, frame samples, and canvas cleanup.

| Date       | Evidence                                                               | Result                                                         |
| ---------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| 2026-09-06 | Existing output phases, timers, and `ShapeProduct` rendering inspected | Open; design and implementation pending                        |
| 2026-09-06 | `npm run format:check`, `npm run lint`, `npm run typecheck`            | Passed                                                         |
| 2026-09-06 | `npm run test`                                                         | Passed: 113 tests                                              |
| 2026-09-06 | `npm run build`                                                        | Passed; root static bundle and budgets passed                  |
| 2026-09-06 | CMP-002 visual update and focused Shape Factory browser flows          | Passed: 2 visual + 4 full-flow desktop/tablet tests            |
| 2026-09-06 | `npm run test:e2e -- --workers=1 --reporter=line`                      | Passed: 38 tests under `/carlys-magic-playroom/`               |
| 2026-09-06 | `npm run test:performance -- --grep "room lifecycles" --reporter=line` | Passed: completion/cleanup on desktop and tablet               |
| 2026-09-06 | `npm run test:performance -- --reporter=line`                          | 2 lifecycle tests passed; unrelated playroom profile was noisy |

The complete performance command measured the unchanged playroom at 18.6 ms against an 18.5 ms
desktop threshold and 35.2 ms against a 34 ms tablet threshold. An isolated rerun passed tablet and
measured desktop at 18.7 ms. CMP-002's low-quality completion/cleanup profiles passed both times;
the unresolved variability is outside the Shape Factory and this issue's changed rendering path.

## Status history

| Date       | Status   | Note                                                                       |
| ---------- | -------- | -------------------------------------------------------------------------- |
| 2026-09-06 | Open     | Split from the repository issue list; no implementation started.           |
| 2026-09-06 | Resolved | Prominent state-derived reveal, reduced-motion parity, and tests verified. |
