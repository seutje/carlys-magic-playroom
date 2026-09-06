# Musical Corner sound assets

These instrument cues are synthesized locally at 48 kHz mono by
`scripts/generate-music-audio.mjs`, then bundled as OGG Vorbis with MP3 fallback. The generator is
deterministic apart from encoder-version differences. It uses only mathematical oscillators and
seeded noise: no samples, speech, remote audio, or third-party sound recordings are included.
Run `npm run assets:music` with FFmpeg built with `libvorbis` and `libmp3lame` to regenerate them.

| Cue                | Design                                                         | Measured OGG / MP3 |
| ------------------ | -------------------------------------------------------------- | ------------------ |
| `drum-normal`      | 142–80 Hz falling body, 196 Hz speaker aid, warm mallet attack | -17.9 / -18.0 LUFS |
| `bell-normal`      | 698 Hz bell with shared inharmonic metal partials              | -17.9 / -17.9 LUFS |
| `xylophone-normal` | 1047 Hz wooden bar, brief seeded mallet tap, fast decay        | -17.9 / -18.0 LUFS |
| `bell-high`        | 1047 Hz version of the shared bell synthesis                   | -17.9 / -18.0 LUFS |
| `bell-low`         | 392 Hz version of the shared bell synthesis                    | -17.9 / -18.0 LUFS |
| `drum-loud`        | Shared drum source with safe limiting                          | -14.0 / -14.1 LUFS |
| `drum-soft`        | Shared drum source with 10 LU contrast                         | -23.9 / -23.9 LUFS |

The 2026-09-06 audit found that the previous encoded `drum-loud` measured -29.5 LUFS while
`drum-soft` measured -27.9 LUFS, reversing the intended contrast. The former bell and xylophone
cues also shared similarly bright attacks and relatively long tails. The revised drum pair differs
by 10 LU, with the soft cue still audible at the default 70% master volume. High and low bells use
the same synthesis and envelope but are separated by about 17 semitones. The xylophone's 0.68 s
wooden attack and fast decay contrast with the bell's 1.32 s metallic ring.

Encoded true peaks measure no higher than -2.5 dBFS in OGG and -2.8 dBFS in MP3. Durations are
0.68–1.32 seconds and each file is under 9 KB. Measurements were made with FFmpeg's EBU R128
filter; both encodes derive from the same normalized WAV during generation.

These are original procedural assets produced for this repository, so there are no third-party
sound licenses or attribution requirements. The repository currently provides no standalone
license; distribution of these files therefore follows the repository's current project terms. A
final human review on physical tablet-class and laptop speakers is still required because waveform
measurements cannot establish perceptual clarity on target hardware.
