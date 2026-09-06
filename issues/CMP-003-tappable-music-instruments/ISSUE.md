# CMP-003: Musical Corner instruments should be directly tappable

## Status

**Resolved**

- Owner: Codex
- Reported: 2026-09-06
- Last updated: 2026-09-06
- Affected area: Musical Corner input and accessibility

## Original report

> make it so you can tap the instrument instead of the words in the music corner

## Description

Musical Corner currently presents large 3D instruments on the stage, but the child must choose
from separate DOM cards at the bottom of the screen. The visible drum, bell, and xylophone should
behave like the natural tap targets during instrument-identification rounds. A three-year-old
should not need to locate or read a word label when the pictured instrument itself invites touch.

DOM controls must remain available as accessible equivalents for keyboard and assistive-
technology users. Direct scene interaction should route through the same typed selection event and
audio-throttling path as the existing choice controls.

Pitch and volume rounds contain multiple choices for the same instrument (high/low bell or
loud/soft drum). Those variants must remain visually and spatially distinct when the instrument is
the tap target.

## Resolution

- Every currently available choice is rendered as a directly tappable stage instrument. A large
  invisible hit sphere makes the target forgiving for mouse and touch, independent of model size.
- The scene sends the selected `MusicChoice` through `MusicRoom`'s existing audio throttle and typed
  state-machine event. Evaluating, celebrating, complete, and other non-input phases ignore scene
  taps safely.
- Pitch uses a small high bell and a large low bell. Loudness uses a large loud drum and a small
  soft drum. The choices also occupy separate stage positions, so no two answers share a target.
- Selection enlarges the responding instrument immediately. This shape change does not depend on
  color and is retained when decorative effects or motion are reduced.
- Visible word labels were removed from the child-facing picture controls. Labeled DOM buttons
  remain synchronized, keyboard operable, focusable, and available to assistive technology.
- Loaded GLBs and primitive fallbacks use the same render wrapper, size mapping, hit target, and
  selection callback.

## Pre-fix implementation notes

- `MusicScene` renders the three instruments as visual React Three Fiber groups without pointer
  handlers or enlarged interaction colliders.
- `MusicRoom` owns `choose`, plays the selected sound through `MusicAudioController`, and dispatches
  the typed `SELECT` event only when rapid-tap throttling permits it.
- `.music-choices` contains the actual buttons. Each card includes a symbol and a visible label such
  as `drum`, `high bell`, or `soft drum`.
- The difficulty-one instrument round maps one choice to each stage instrument. Later rounds map
  two sound variants to one shared instrument, so an instrument mesh alone cannot distinguish the
  available answers.
- Missing GLB assets already fall back to primitive instruments; direct tapping must work for both
  loaded models and fallbacks.

## Desired behavior

- In instrument-identification rounds, tapping the visible stage instrument selects and plays that
  choice immediately.
- The interactive collider is larger than the artwork and supports mouse and touch Pointer Events.
- Repeated rapid taps remain bounded and cannot cause overlapping audio or duplicate transitions.
- Disabled, evaluating, celebration, pause, and completion states ignore input safely.
- Keyboard and screen-reader users retain labeled DOM button equivalents with visible focus.
- Missing models do not remove the interaction target.
- Visual feedback identifies which instrument responded without relying only on color.

## Acceptance criteria

- [x] Tapping the drum, bell, or xylophone in an instrument round invokes the same selection path as
      its corresponding choice button.
- [x] Scene targets provide forgiving hit regions sized for young children.
- [x] Mouse click, touch emulation, pointer cancellation, and repeated rapid taps behave safely.
- [x] The instrument gives immediate visible feedback and plays at most the bounded audio response.
- [x] Interaction is disabled whenever the typed activity state is not accepting a choice.
- [x] Direct tapping works when a GLB loads and when its primitive fallback is shown.
- [x] Accessible DOM controls remain keyboard operable, labeled, and synchronized with scene state.
- [x] A documented interaction decision exists for pitch and volume rounds; it must not make two
      answers share one indistinguishable tap target.
- [x] Unit/integration coverage verifies choice mapping and guards invalid or duplicate selection.
- [x] End-to-end coverage taps a rendered instrument and completes an instrument round.

## Implementation checklist

- [x] Define a typed scene-to-room selection callback using `InstrumentId` or a choice identifier.
- [x] Decide the scope and presentation for pitch and volume choices.
- [x] Add explicit, oversized hit meshes or equivalent pointer targets to every instrument.
- [x] Route scene taps through `MusicRoom`'s existing guarded `choose` behavior.
- [x] Add pressed/selected feedback that respects reduced effects and does not rely only on color.
- [x] Preserve accessible DOM equivalents without forcing visible word reading for child play.
- [x] Test loaded-model and missing-model paths.
- [x] Add unit, integration, and end-to-end regression coverage.
- [x] Run the required repository validation commands.

## Likely files

- `src/rooms/music/MusicRoom.tsx`
- `src/rooms/music/MusicScene.tsx`
- `src/rooms/music/music.types.ts`
- `src/rooms/music/music.audio.ts`
- `src/app/app.css`
- `tests/unit/musicActivity.test.ts`
- `tests/e2e/startup.spec.ts`

## Validation record

| Date       | Evidence                                                                   | Result                           |
| ---------- | -------------------------------------------------------------------------- | -------------------------------- |
| 2026-09-06 | Scene rendering, choice mapping, fallback models, and input path inspected | Open; interaction design pending |
| 2026-09-06 | Unit, build, and desktop/tablet direct-scene Playwright coverage           | Resolved                         |

## Status history

| Date       | Status   | Note                                                             |
| ---------- | -------- | ---------------------------------------------------------------- |
| 2026-09-06 | Open     | Split from the repository issue list; no implementation started. |
| 2026-09-06 | Resolved | Stage instruments are tappable; size distinguishes variants.     |
