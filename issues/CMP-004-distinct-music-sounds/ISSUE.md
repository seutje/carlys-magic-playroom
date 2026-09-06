# CMP-004: Musical Corner sounds need stronger differentiation

## Status

**Open**

- Owner: Unassigned
- Reported: 2026-09-06
- Last updated: 2026-09-06
- Affected area: Musical Corner educational audio assets

## Original report

> make sounds in music corner more distinct

## Description

The sounds used as targets and choices in Musical Corner are not perceptually distinct enough.
Children should be able to recognize the instrument, pitch, or volume contrast being taught
without relying on labels or subtle audio-production differences.

This issue concerns the content of the bundled cues rather than simply whether different files or
audio keys exist. The sound set needs an auditory review on realistic tablet and laptop speakers,
where bass response, loudness, and short transients may be limited.

## Current implementation notes

- The room teaches three concepts: instrument (drum, bell, xylophone), pitch (high/low bell), and
  volume (loud/soft drum).
- Each `SoundId` already resolves to its own locally bundled OGG and MP3 files under
  `public/audio/music/`.
- The same cue is used for the target and its matching selection, which is appropriate for exact
  matching but does not guarantee that distractors are easy to tell apart.
- `MusicAudioController` interrupts/restarts educational target audio and throttles selections to
  avoid overlapping rapid taps.
- Runtime audio must remain local; replacing cues must preserve base-path-aware asset loading and
  must not introduce remote speech or audio services.

## Desired behavior

- Drum, bell, and xylophone have clearly different timbre and attack even through small speakers.
- High and low bell cues have an unmistakable pitch separation while retaining a recognizable
  shared bell identity.
- Loud and soft drum cues are distinguishable at normal listening volume without making the loud
  version startling or the soft version inaudible.
- Cue durations are short and consistent enough for repeated child-led comparison.
- Sounds remain warm, non-punitive, unclipped, and free of harsh transients.
- OGG and MP3 encodes represent the same intended source cue and have sensible perceived loudness.
- Visual patterns continue to provide an equivalent hint when audio is muted or unavailable.

## Acceptance criteria

- [ ] Every defined `SoundId` has working OGG and MP3 assets loaded through the existing base-aware
      resolver.
- [ ] Instrument cues are reliably distinguishable in a documented listening review on at least a
      tablet-class speaker and a desktop/laptop speaker.
- [ ] High/low bell cues have a clearly documented pitch contrast.
- [ ] Loud/soft drum cues have a clear perceived-volume contrast without clipping, startling peaks,
      or an inaudible soft cue at the default volume.
- [ ] No cue contains speech, negative feedback, or a misleading secondary instrument.
- [ ] Playback remains bounded under rapid taps and target replay interrupts cleanly.
- [ ] Muted and failed-audio states retain usable visual equivalents.
- [ ] Automated asset coverage confirms all cue/format pairs exist and can be requested beneath the
      configured GitHub Pages base path.
- [ ] Human auditory review findings and the final asset provenance/license are recorded here.

## Implementation checklist

- [ ] Audit and describe the perceptual problem in each current cue pair.
- [ ] Record basic cue properties such as duration, peak level, and clipping where tooling permits.
- [ ] Define safe contrast targets for timbre, pitch, and perceived volume.
- [ ] Source or produce revised local master cues with documented provenance and license.
- [ ] Export matching OGG and MP3 fallbacks using stable existing audio keys.
- [ ] Review on representative small speakers at default and reduced volume.
- [ ] Confirm the room's visual patterns still correspond to the revised sounds.
- [ ] Run audio unit tests, end-to-end asset checks, and all required repository validation commands.

## Likely files

- `public/audio/music/*.ogg`
- `public/audio/music/*.mp3`
- `public/audio/music/README.md`
- `src/rooms/music/music.audio.ts`
- `src/rooms/music/music.types.ts`
- `tests/unit/musicAudio.test.ts`
- `tests/e2e/startup.spec.ts`
- `tests/e2e/offline.spec.ts`

## Validation record

No replacement audio has been produced or reviewed yet.

| Date       | Evidence                                                                | Result                        |
| ---------- | ----------------------------------------------------------------------- | ----------------------------- |
| 2026-09-06 | Existing cue IDs, bundled format pairs, and playback controls inspected | Open; auditory review pending |

## Status history

| Date       | Status | Note                                                             |
| ---------- | ------ | ---------------------------------------------------------------- |
| 2026-09-06 | Open   | Split from the repository issue list; no implementation started. |
