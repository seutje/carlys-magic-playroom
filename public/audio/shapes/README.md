# Magic Shape Factory voice assets

Interim child-facing speech is generated at build time with the `en-US-AvaNeural` voice at
`-10%` rate and `-2Hz` pitch. Source speech is trimmed, normalized to -18 LUFS with a -2 dB
true-peak ceiling, converted to 48 kHz mono, and bundled as OGG with MP3 fallback.

The instruction clips describe all four factory steps:

| File stem                     | Spoken line                                     |
| ----------------------------- | ----------------------------------------------- |
| `instruction`                 | “Put the small red square in the machine.”      |
| `instruction-blue-circle`     | “Put the big blue circle in the machine.”       |
| `instruction-yellow-triangle` | “Put the small yellow triangle in the machine.” |
| `instruction-green-diamond`   | “Put the big green diamond in the machine.”     |
| `success`                     | Existing successful shape celebration           |

Each cue is bundled as a 48 kHz mono OGG Vorbis/MP3 pair, trimmed and normalized to -18 LUFS with
a -2 dB true-peak target. The application never uses runtime TTS or remote audio requests.
