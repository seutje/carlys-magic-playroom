# CMP-007: Build-a-Critter legs do not follow the body color

## Status

**Resolved**

- Owner: Codex
- Reported: 2026-09-07
- Last updated: 2026-09-07
- Affected area: Build-a-Critter Lab component coloring and missing-model fallback

## Original report

> when changing the build-a-crittter body color, the legs should also change color, they currently
> remain lavender, no matter what the body color is.

## Description

Changing a critter from lavender to mint or peach recolors the body but leaves attached legs at
their authored lavender color. The mismatch affects loaded GLB components and primitive fallbacks,
so the assembled critter does not provide coherent visual feedback for the selected color.

## Reproduction

1. Enter Build-a-Critter Lab and attach a compatible set of legs.
2. Select mint or peach from the Color controls.
3. Observe that the body changes immediately while the leg shafts remain lavender.
4. Repeat with unavailable Critter GLBs to observe the fixed-color fallback legs.

## Root cause

- `CritterScene` passed the palette color only to the body component model.
- Loaded leg shafts use their own `CMP_Critter_Dark` material, which was not included in the
  cloned-instance recoloring contract.
- Primitive leg capsules used a hardcoded lavender material.

## Resolution

- Loaded body surfaces and leg shafts now share the selected critter color through cloned material
  instances; immutable source materials remain unchanged.
- Primitive fallback legs receive the same typed palette value as the fallback body.
- Shoe, toe, and knee accent materials retain their authored colors and visual distinction.

## Acceptance criteria

- [x] Lavender, mint, and peach selections apply to both the body and attached leg shafts.
- [x] A color change updates already attached loaded legs immediately.
- [x] Primitive fallback legs match the fallback body color.
- [x] Leg shoe, toe, and knee accents retain their authored colors.
- [x] Source GLB materials remain immutable and visible cloned materials are disposed normally.
- [x] Body/leg compatibility, assembly state, persistence, and reactions remain unchanged.
- [x] Focused unit coverage protects the loaded-material recoloring contract.
- [x] Deterministic desktop and tablet screenshots protect live loaded-leg recoloring.
- [x] The correction remains base-path independent because no asset paths changed.

## Changed files

- `src/rooms/critter/CritterScene.tsx`
- `src/rooms/critter/critter.model.ts`
- `tests/unit/critterAssetModel.test.ts`
- `tests/e2e/startup.spec.ts`
- Updated Critter completion baselines under `tests/e2e/startup.spec.ts-snapshots/`
- `PLAN.md`
- `CHANGELOG.md`

## Validation record

| Date       | Evidence                                                   | Result               |
| ---------- | ---------------------------------------------------------- | -------------------- |
| 2026-09-07 | Loaded GLB material names and fallback rendering audited   | Passed               |
| 2026-09-07 | Focused material-cloning regression coverage               | Passed               |
| 2026-09-07 | Format, lint, strict typecheck, 124 unit/integration tests | Passed               |
| 2026-09-07 | Full serial E2E suite under `/carlys-magic-playroom/`      | Passed: 42 tests     |
| 2026-09-07 | Desktop/tablet loaded and fallback Critter baselines       | Passed and inspected |
| 2026-09-07 | Room lifecycle and playroom performance checks             | Passed: 4 tests      |

## Status history

| Date       | Status   | Note                                                        |
| ---------- | -------- | ----------------------------------------------------------- |
| 2026-09-07 | Open     | Body color was not propagated to loaded or fallback legs.   |
| 2026-09-07 | Resolved | Leg shafts now follow the selected color in both renderers. |
