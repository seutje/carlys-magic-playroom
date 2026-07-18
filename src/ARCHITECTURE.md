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

Each lazy room module declares capabilities, preload work, and a session factory. `RoomHost` owns start, exit, and disposal, so room resources cannot outlive navigation. Activity reducers reuse typed lifecycle phases/events while room events remain local.

Shared instruction templates, hint plans, pointer lifecycle helpers, channel-priority audio, owned timers, and deterministic test doubles are engine services rather than curriculum decisions. IndexedDB stores a validated versioned root record; invalid room subsections recover independently and legacy train progress migrates into the root.

The root settings provider owns validated parent preferences and persists complete settings snapshots optimistically. Lazy rooms consume motion, effects, hint timing, and audio policy through shared hooks rather than importing persistence. The grown-up area reads bounded room progress for a neutral local summary and exposes separately confirmed reset scopes; it never owns curriculum state.
