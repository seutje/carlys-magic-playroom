# CMP-002: Shape Factory needs a clearer final-shape animation

## Status

**Open**

- Owner: Unassigned
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

## Current implementation notes

- The typed state machine already separates `processing`, `output`, `celebrating`, and `complete`.
- `ShapeFactoryRoom` advances those phases with owned watchdog timers: approximately 1.1 seconds
  for processing, 0.7 seconds for output, and 1.2 seconds for celebration in standard motion.
- `ShapeFactoryScene` renders `ShapeProduct` only when `outputItemId` exists.
- The product currently appears at a fixed position with a fixed rotation and scale; the prominent
  celebration layer is text (`Shape made!`) rather than a focused reveal of the created object.
- Reduced-motion timing is already shorter and must remain supported without hiding the result.

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

- [ ] A correct placement produces a visually continuous processing-to-output-to-celebration
      sequence.
- [ ] The final product is substantially more prominent than its current small, static output.
- [ ] The rendered product accurately reflects target kind, color, and size.
- [ ] The result is understandable with audio muted and without reading the status text.
- [ ] Reduced-motion mode clearly shows the same result without large movement or rapid animation.
- [ ] Repeated or rapid input cannot duplicate the output or complete a step more than once.
- [ ] Missing animation completion cannot trap the activity; watchdog recovery remains covered.
- [ ] Deterministic visual tests cover normal and reduced-motion output states.
- [ ] Frame stability and object cleanup are verified after completing and leaving the room.

## Implementation checklist

- [ ] Capture the current output sequence as a baseline.
- [ ] Define the animation stages and the state-derived timing contract.
- [ ] Implement the final-product reveal without putting authoritative progression in frame logic.
- [ ] Add the reduced-motion presentation.
- [ ] Verify output geometry for circle, square, triangle, diamond, small, and big variants.
- [ ] Ensure effects are bounded and honor adaptive-quality settings.
- [ ] Add or update state-machine, end-to-end, and visual-regression tests.
- [ ] Run the required repository validation commands.

## Likely files

- `src/rooms/shapes/ShapeFactoryScene.tsx`
- `src/rooms/shapes/ShapeFactoryRoom.tsx`
- `src/rooms/shapes/shapeFactory.model.ts`
- `src/rooms/shapes/shapes.machine.ts`
- `src/app/app.css`
- `tests/unit/shapeFactory.test.ts`
- `tests/e2e/startup.spec.ts`

## Validation record

No fix has been implemented or validated yet.

| Date       | Evidence                                                               | Result                                  |
| ---------- | ---------------------------------------------------------------------- | --------------------------------------- |
| 2026-09-06 | Existing output phases, timers, and `ShapeProduct` rendering inspected | Open; design and implementation pending |

## Status history

| Date       | Status | Note                                                             |
| ---------- | ------ | ---------------------------------------------------------------- |
| 2026-09-06 | Open   | Split from the repository issue list; no implementation started. |
