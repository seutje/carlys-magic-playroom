# Musical Corner sound assets

These interim instrument cues are synthesized locally at 48 kHz mono with additive sine partials
and exponential decay, then bundled as OGG with MP3 fallback. No runtime synthesis or remote audio
is used.

| Cue                | Design                                 | Integrated loudness target |
| ------------------ | -------------------------------------- | -------------------------- |
| `drum-normal`      | 110 Hz falling strike plus 55 Hz body  | -18 LUFS                   |
| `bell-normal`      | 660 Hz fundamental with 2x/3x partials | -18 LUFS                   |
| `xylophone-normal` | 880 Hz bar with bright 3x partial      | -18 LUFS                   |
| `bell-high`        | 990 Hz bell                            | -18 LUFS                   |
| `bell-low`         | 440 Hz bell                            | -18 LUFS                   |
| `drum-loud`        | Drum comparison cue                    | -14 LUFS                   |
| `drum-soft`        | Drum comparison cue                    | -28 LUFS                   |

All cues use a -2 dB true-peak ceiling and a short fade. Each encoded file is under 9 KB. The
frequency ranges favor clarity on tablet speakers; high/low differ by more than an octave and
loud/soft differ by 14 LU. These assets should receive a final listening review on the intended
physical tablet before release artwork is approved.
