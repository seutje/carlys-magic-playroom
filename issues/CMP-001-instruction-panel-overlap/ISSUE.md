# CMP-001: Instruction panels can overlap tap targets

## Status

**Open**

- Owner: Unassigned
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
The exact overlap still needs to be reproduced and recorded before implementation begins.

This is a child-usability issue: a visible instruction must not obscure the object it asks the
child to tap, and the usable hit target must remain large and reachable without precise input.

## Current implementation notes

- `GardenRoom` renders the 3D garden, `.garden-guide`, and `.garden-controls` as separate layers.
- The garden guide is absolutely positioned near the top center, while the rain cloud and sun are
  interactive objects in the full-screen `GardenScene` canvas.
- Responsive rules move the guide at narrow widths, but there is no shared collision or reserved-
  layout contract between instruction overlays and scene interaction zones.
- Other rooms use similar absolutely positioned guide panels and should be audited as part of the
  fix rather than assuming the garden is the only affected room.

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

- [ ] The reported Little Garden cloud overlap is reproduced with a documented viewport,
      orientation, and browser/device conditions, or the tested conditions are recorded if it
      cannot be reproduced.
- [ ] The garden instruction panel does not visually cover the cloud, sun, or their effective hit
      targets at all supported responsive breakpoints.
- [ ] Instruction panels and primary interaction targets do not overlap in Train, Critter,
      Garden, Shapes, or Music at the agreed test viewport matrix.
- [ ] Global Home and Replay controls remain visible, operable, and keyboard accessible.
- [ ] Touch targets meet the repository minimum sizing guidance and tolerate imprecise taps.
- [ ] High-contrast, reduced-motion, and reduced-effects modes remain usable.
- [ ] Automated layout or visual-regression coverage protects the reproduced case.
- [ ] Manual touch-emulation checks pass in portrait and landscape.

## Implementation checklist

- [ ] Capture the failing layout and identify the exact viewport and state.
- [ ] Inventory fixed and absolute overlays in every room.
- [ ] Define reserved safe regions or responsive placement rules for guide panels and controls.
- [ ] Implement the smallest shared or room-specific layout correction that covers the failure.
- [ ] Confirm scene hit areas match the visible targets after layout changes.
- [ ] Add deterministic screenshot coverage for representative narrow, short, and tablet layouts.
- [ ] Test mouse, keyboard, and touch-emulated interaction.
- [ ] Run the required repository validation commands.

## Likely files

- `src/app/app.css`
- `src/rooms/garden/GardenRoom.tsx`
- `src/rooms/garden/GardenScene.tsx`
- Other room components using `*-guide` overlays
- `tests/e2e/startup.spec.ts`
- Visual test fixtures and snapshots

## Validation record

No fix has been implemented or validated yet.

| Date       | Evidence                                                               | Result                     |
| ---------- | ---------------------------------------------------------------------- | -------------------------- |
| 2026-09-06 | Issue documented from the existing report and current layout inspected | Open; reproduction pending |

## Status history

| Date       | Status | Note                                                             |
| ---------- | ------ | ---------------------------------------------------------------- |
| 2026-09-06 | Open   | Split from the repository issue list; no implementation started. |
