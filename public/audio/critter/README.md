# Build-a-Critter generated voice assets

These interim clips were generated at build time on 2026-07-18 with `edge-tts` 7.2.8 and the soft `en-US-AvaNeural` voice. They use the same `-10%` rate and `-2Hz` pitch settings as the train voice.

| File stem       | Spoken line              |
| --------------- | ------------------------ |
| `choose-eyes`   | “Choose some eyes!”      |
| `choose-mouth`  | “Choose a happy mouth!”  |
| `choose-legs`   | “Choose some legs!”      |
| `critter-ready` | “Your critter is ready!” |

Each cue is delivered as 48 kHz mono OGG Vorbis and MP3, trimmed and normalized to -18 LUFS with a -2 dB true-peak target. The application uses only these bundled files at runtime, works offline, and can replace them with human recordings without changing cue keys.
