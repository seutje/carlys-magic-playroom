# Tiny Delivery Train generated voice assets

These interim voice clips were generated at build time on 2026-07-18 with `edge-tts` 7.2.8 and the Microsoft `en-US-AvaNeural` voice. Ava was selected for her soft, caring, friendly delivery. Generation used a `-10%` speaking rate and `-2Hz` pitch adjustment.

The application does not use browser text-to-speech or a remote runtime speech service. The generated files are ordinary static assets bundled with the game, work offline, and may later be replaced by human recordings without changing code or audio keys.

Provide both OGG and MP3 versions of each clip:

| File stem                      | Spoken line                          |
| ------------------------------ | ------------------------------------ |
| `instruction-two-yellow-ducks` | “Put two yellow ducks in the train.” |
| `count-one`                    | “One!”                               |
| `count-two`                    | “Two!”                               |
| `count-three`                  | “Three!”                             |
| `success-all-aboard`           | “All aboard!”                        |

Delivery processing:

- One consistent neural speaker with no music or background noise.
- Leading and trailing silence trimmed while retaining natural endings.
- EBU R128 loudness normalization targeting -18 LUFS and -2 dB true peak.
- 48 kHz mono OGG Vorbis and MP3 delivery files.
- Total delivery size is under 110 kB for all ten files.

Paths are `audio/train/<file-stem>.ogg` and `audio/train/<file-stem>.mp3`. The train speech controller serializes instructions, counts, and success speech and interrupts the queue cleanly when Replay is requested.
