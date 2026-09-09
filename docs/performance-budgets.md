# Performance budgets

The production build writes `dist/bundle-report.json` and fails when a hard budget is exceeded.

| Area                             |              Hard budget | Current intent                                                               |
| -------------------------------- | -----------------------: | ---------------------------------------------------------------------------- |
| Initial JS and CSS               | 300 KB raw / 100 KB gzip | Startup UI, settings, persistence, and navigation only                       |
| Each room entry chunk            |                40 KB raw | Curriculum and room UI stay lazy-loaded                                      |
| Bundled MP3 and OGG cue audio    |               600 KB raw | Local speech and short musical cues for offline use                          |
| App-wide soundtrack              |                 3 MB raw | Requested after Play and cached locally for uninterrupted offline looping    |
| Shared React Three Fiber runtime |               900 KB raw | Documented exception; lazy-loaded only after Play and shared by every canvas |

The shared 3D runtime is deliberately excluded from the initial startup budget. Replacing it would be an architectural change with greater correctness risk than its current lazy, cached, shared cost. The budget prevents growth beyond the measured exception.

The soundtrack has a separate budget so its intentionally longer duration does not hide growth in instructional and interaction cues. It is not part of the initial JavaScript and CSS payload; playback and browser media preloading begin only after the Play gesture.

Adaptive quality does not alter game definitions or reducers. Low mode uses DPR 1, disables antialiasing, shadows, decorative objects, and decorative motion, and retains one essential feedback particle. Medium mode raises DPR to 1.25 and keeps limited decoration. High mode permits DPR 1.5, shadows, and the full bounded effect count.
