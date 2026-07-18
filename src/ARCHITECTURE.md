# Source boundaries

- `app`: application composition and global recovery.
- `engine`: reusable browser infrastructure, kept independent from room curricula.
- `playroom`: central room selection and transitions.
- `rooms`: lazy room modules; educational rules remain independent of rendering.
- `curriculum`: skill and difficulty decisions.
- `persistence`: validated, versioned local data.
- `state`: serializable application and session state.
- `content`: localizable content definitions.
- `ui`: accessible DOM controls and overlays.
- `testing`: shared deterministic test support.
- `types`: truly cross-cutting domain types only.

The intended activity flow is generator → serializable definition → typed state machine → render adapter → React scene. Room code must not import from another room.

The startup tier excludes Three.js. Play initializes audio and lazy-loads the playroom scene; room selection then resolves one typed dynamic-import entry. Child navigation is a guarded pure reducer, while per-room rendering and resources live only for the selected room's mount lifecycle.
