# CMP-001: Instruction panels can overlap tap targets

## Status

**Resolved**

- Owner: Codex
- Reported: 2026-09-06
- Last updated: 2026-09-06
- Affected area: Shared room layout and responsive child controls

## Original report

> dialog box in some games overlaps tap controls (like the cloud in the garden game)

## Description

Instruction and feedback panels can occupy the same screen area as child-facing tap targets.
The rain cloud in Little Garden is the known example, but the layout problem may affect other
rooms, viewport sizes, orientations, browser chrome configurations, or devices with safe-area
insets.

The report calls this element a dialog box. In the current implementation, the likely element is
an instruction/feedback overlay such as `.garden-guide`, rather than a semantic modal dialog.
The overlap was reproduced at 320 × 568 CSS pixels with enlarged text: the upper Garden guide
intersected the 80 CSS-pixel protected regions around both canvas helpers. The audit also found
collisions between the guide and the active Shape Factory opening or Music replay target on narrow
portrait and short landscape screens.

This is a child-usability issue: a visible instruction must not obscure the object it asks the
child to tap, and the usable hit target must remain large and reachable without precise input.

## Resolution

- `GardenRoom` renders the 3D garden, `.garden-guide`, and `.garden-controls` as separate layers.
- The Garden guide now uses the lower reserved instruction band while the rain cloud and sun remain
  interactive in the unobscured upper canvas.
- Narrow layouts give the other room guides a compact safe band below the global controls.
- Short landscape layouts move those guides into a target-free left rail and keep bottom controls
  inside the visible dynamic viewport.
- Shape Factory openings and the Music replay target use explicit narrow-screen clearance.

## Desired behavior

- Instructions and feedback remain readable without covering the target they describe.
- Every primary tap target retains a visible and usable hit area of at least 64 CSS pixels,
  preferably 80 CSS pixels or more on tablets.
- Layout remains usable in portrait and landscape, at supported narrow and short viewports, with
  safe-area insets and enlarged text.
- Repositioning does not create a new overlap with Home, Replay, pause, progress, or recovery
  controls.
- No child-facing control becomes dependent on reading or precise tapping.

## Acceptance criteria

- [x] The reported Little Garden cloud overlap is reproduced with a documented viewport,
      orientation, and browser/device conditions, or the tested conditions are recorded if it
      cannot be reproduced.
- [x] The garden instruction panel does not visually cover the cloud, sun, or their effective hit
      targets at all supported responsive breakpoints.
- [x] Instruction panels and primary interaction targets do not overlap in Train, Critter,
      Garden, Shapes, or Music at the agreed test viewport matrix.
- [x] Global Home and Replay controls remain visible, operable, and keyboard accessible.
- [x] Touch targets meet the repository minimum sizing guidance and tolerate imprecise taps.
- [x] High-contrast, reduced-motion, and reduced-effects modes remain usable.
- [x] Automated layout or visual-regression coverage protects the reproduced case.
- [x] Touch-emulation checks pass in portrait and landscape.

## Implementation checklist

- [x] Capture the failing layout and identify the exact viewport and state.
- [x] Inventory fixed and absolute overlays in every room.
- [x] Define reserved safe regions or responsive placement rules for guide panels and controls.
- [x] Implement the smallest shared or room-specific layout correction that covers the failure.
- [x] Confirm scene hit areas match the visible targets after layout changes.
- [x] Add deterministic layout and screenshot coverage for representative narrow, short, and
      tablet layouts.
- [x] Test mouse, keyboard, and touch-emulated interaction.
- [x] Run the required repository validation commands.

## Changed files

- `src/app/app.css`
- `tests/e2e/instruction-layout.spec.ts`
- Garden visual-regression snapshots under `tests/e2e/startup.spec.ts-snapshots/`
- `PLAN.md`
- `CHANGELOG.md`

## Validation record

The Garden guide now occupies a reserved band above its bottom helper controls, clear of the canvas
sun and cloud. At widths up to 700 CSS pixels, the other room guides use a compact band below the
global controls; short landscape layouts use a target-free left rail. Shape openings and the Music
replay target receive explicit narrow-screen clearance. All positioning remains safe-area-aware.

The deterministic browser audit covers 320 × 568 portrait, 667 × 375 landscape, and 1024 × 768
tablet landscape at 112.5% text scaling. It checks all five rooms, global controls, visible primary
targets, a minimum 64 CSS-pixel target size, and conservative 80 CSS-pixel Garden canvas zones.

| Date       | Evidence                                                               | Result                                                |
| ---------- | ---------------------------------------------------------------------- | ----------------------------------------------------- |
| 2026-09-06 | Issue documented from the existing report and current layout inspected | Open; reproduction pending                            |
| 2026-09-06 | `npm run format:check`, `npm run lint`, `npm run typecheck`            | Passed                                                |
| 2026-09-06 | `npm run test`                                                         | Passed: 111 tests                                     |
| 2026-09-06 | `npm run build`                                                        | Passed; static bundle budgets passed                  |
| 2026-09-06 | `npm run test:e2e -- --workers=2 --reporter=line`                      | Passed: 36 tests in desktop and touch-tablet Chromium |

## Status history

| Date       | Status   | Note                                                                      |
| ---------- | -------- | ------------------------------------------------------------------------- |
| 2026-09-06 | Open     | Split from the repository issue list; no implementation started.          |
| 2026-09-06 | Resolved | Responsive safe regions, target sizing, and regression coverage verified. |
