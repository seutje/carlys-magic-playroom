# Magic Shape Factory voice assets

Interim child-facing speech is generated at build time with the `en-US-AvaNeural` voice at
`-10%` rate and `-2Hz` pitch. Source speech is trimmed, normalized to -18 LUFS with a -2 dB
true-peak ceiling, converted to 48 kHz mono, and bundled as OGG with MP3 fallback.

The factory's introductory curriculum target is intentionally fixed to a small red square while
this interim speech set is in use. The deterministic generator and its tests cover the full shape,
size, and color vocabulary; expanding child-facing targets requires adding matching reviewed local
prompts first. No runtime TTS or remote audio request is used.
