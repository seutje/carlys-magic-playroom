# Carly’s Magic Playroom

## Product and Technical Design Document

**Document status:** Initial reference specification
**Application type:** Browser-based educational game
**Target audience:** Children approximately 3 years old
**Primary platform:** Touchscreen tablets and desktop browsers
**Build system:** Vite
**Frontend language:** TypeScript
**Deployment target:** GitHub Pages
**Server-side logic:** None
**Backend services:** None required
**Primary input:** Single-touch, mouse, and optional keyboard
**Working title:** Carly’s Magic Playroom

---

## 1. Executive Summary

Carly’s Magic Playroom is a browser-based educational game for young children. It presents a colorful, welcoming 3D playroom containing five activity areas:

1. The Tiny Delivery Train
2. Build-a-Critter Lab
3. Little Garden
4. Magic Shape Factory
5. Musical Corner

Each activity must be extremely simple to play. A three-year-old should be able to understand the interaction through animation, audio, demonstration, and experimentation rather than written instructions.

Although the gameplay is simple, the application should be sophisticated internally. It should demonstrate strong frontend architecture, deterministic simulation, procedural activity generation, adaptive difficulty, 3D rendering, audio coordination, local persistence, accessibility, automated testing, and robust error recovery.

The application must run entirely in the browser. It must not depend on APIs, databases, authentication services, serverless functions, or server-side rendering. It must be deployable as a static Vite application on GitHub Pages.

The first release should focus on reliability and polish rather than a large amount of content. Each room should contain one complete activity loop, with an architecture that supports future activities and additional rooms.

---

## 2. Product Vision

Carly’s Magic Playroom should feel like an animated toy rather than a traditional game.

The child enters a warm, magical playroom and selects an activity by tapping an inviting object or area. Every room encourages curiosity, recognizes effort, and avoids punishment.

The experience should communicate:

* “You are safe here.”
* “You can touch things.”
* “Trying is good.”
* “Mistakes are part of playing.”
* “Something delightful will happen when you interact.”

The application should never require reading, precise timing, fast reactions, complex gestures, or prior knowledge of game conventions.

---

## 3. Core Product Principles

### 3.1 Simple on the Surface

At any moment, the child should have no more than one primary task and a small number of obvious interactive objects.

Interactions should primarily use:

* Tap
* Drag
* Drop
* Tap and hold only when unavoidable

The game should not require:

* Double-clicking
* Right-clicking
* Pinch gestures
* Multi-touch gestures
* Precise rotation controls
* Complex menus
* Reading instructions
* Time pressure

### 3.2 Sophisticated Under the Hood

The application should use production-quality systems for:

* 3D rendering
* Scene management
* Activity state machines
* Procedural content generation
* Difficulty adaptation
* Input abstraction
* Audio scheduling
* Local persistence
* Asset loading
* Error recovery
* Performance monitoring
* Automated testing

### 3.3 No Punitive Failure

Incorrect actions should not produce harsh sounds, red error screens, lost progress, or failure states.

The system should respond using one of the following:

* Gentle redirection
* A visual hint
* A repeated demonstration
* A simplified instruction
* A temporary reduction in available choices
* Positive acknowledgment of the attempt

The child should always be able to continue.

### 3.4 Immediate Feedback

Every meaningful interaction should produce feedback within approximately 100 milliseconds.

Feedback may include:

* Object movement
* Scale animation
* Glow
* Sound
* Character reaction
* Haptic feedback where supported
* Particle effect
* Spoken acknowledgment

### 3.5 Privacy by Default

The application must not transmit child activity data.

By default:

* No analytics service
* No advertising
* No external tracking
* No user accounts
* No cloud saves
* No remote speech processing
* No microphone recording
* No personal information collection

All progress data must remain on the device.

### 3.6 Offline-Friendly

After the application and assets have been loaded, the game should remain usable without an internet connection.

Offline support is a release goal, but the core application must remain functional even if service-worker installation fails.

---

## 4. Target Users

### 4.1 Primary User

A child approximately three years old.

Likely characteristics:

* Limited or no reading ability
* Developing fine motor control
* Short attention span
* May tap repeatedly
* May drag objects outside intended regions
* May stop interacting without warning
* May not understand conventional game icons
* May replay the same activity many times
* May use a tablet in landscape or portrait mode
* May accidentally refresh or close the page

### 4.2 Secondary User

A parent, caregiver, teacher, or developer.

Secondary users may need to:

* Start the game
* Adjust volume
* Select content categories
* Reset progress
* Disable motion-heavy effects
* Inspect local progress
* Enter a parent-only settings area
* Test individual rooms
* Run diagnostic modes

---

## 5. Release Scope

## 5.1 Version 1 Scope

Version 1 must include:

* A central 3D playroom hub
* Five selectable activity rooms
* One complete activity in each room
* Spoken and visual instructions
* Local progress persistence
* Volume settings
* Reduced-motion setting
* Basic parent settings
* Touch and mouse support
* Responsive layout
* GitHub Pages deployment
* Automated tests for critical logic
* Graceful asset-loading behavior
* Offline-capable production build
* Restart and recovery mechanisms

## 5.2 Out of Scope for Version 1

The following should not be required:

* User accounts
* Online multiplayer
* Social features
* Leaderboards
* Cloud saves
* In-app purchases
* Advertisements
* Backend APIs
* Server-side rendering
* Remote content management
* Generative AI at runtime
* Speech recognition
* Camera access
* Microphone access
* Real-time analytics
* Parent email reports
* Native mobile applications

The architecture should not prevent some of these features from being added later, but no version 1 code should depend on them.

---

## 6. High-Level Experience

## 6.1 Application Start

When the application loads:

1. A lightweight branded loading screen appears.
2. Critical assets load.
3. A large “Play” button becomes available.
4. The user taps Play.
5. Audio is initialized from the user gesture.
6. The application transitions to the central playroom.

The Play button is necessary because browsers often block audio playback before user interaction.

## 6.2 Central Playroom

The central playroom acts as the activity selector.

It contains five large, animated activity areas:

* A toy train
* A creature-building table
* A garden window or greenhouse
* A shape machine
* A musical stage

Each area should:

* Be visually distinct
* Animate gently when idle
* React when touched
* Speak or play a recognizable sound
* Have a large interaction target
* Avoid relying on text labels

When an activity area is selected:

1. The camera moves toward the area.
2. Decorative transitions hide loading.
3. The activity initializes.
4. A short visual demonstration introduces the task.
5. The activity begins.

## 6.3 Returning to the Hub

Each room must include a consistent home control.

The home control should:

* Use a recognizable house or playroom icon
* Be positioned away from common drag areas
* Require one deliberate tap
* Avoid interrupting active dragging
* Save current progress before returning

A child should never become trapped inside an activity.

---

## 7. Educational Goals

The initial game should cover the following concepts:

* Counting from one to three
* Basic colors
* Common shapes
* Matching
* Sorting
* Animal body parts
* Basic cause and effect
* Simple sequencing
* Animal and object categories
* Sound matching
* Loud and soft
* High and low pitch
* Spatial concepts such as in, on, beside, and under

The educational content should be introduced through play rather than formal testing.

---

## 8. The Five Rooms

# 8.1 The Tiny Delivery Train

## Purpose

Teach counting, colors, categories, and simple destination matching.

## Core Activity

The child receives a spoken request such as:

> “Put two yellow ducks on the train.”

The child drags the requested objects into the train car. When the correct objects are loaded, the train automatically travels to a matching destination.

## Version 1 Learning Targets

* Count one to three
* Recognize basic colors
* Match object categories
* Understand “in”
* Follow a one-step instruction

## Scene Elements

* Toy train engine
* One large train car
* Loading platform
* Three to six draggable objects
* One or two destination buildings
* Decorative scenery
* Friendly conductor character or animated face

## Interaction Loop

1. Show available objects.
2. Speak the instruction.
3. Highlight the train car briefly.
4. Allow dragging.
5. Snap valid objects into large loading slots.
6. Count loaded objects aloud.
7. Give gentle feedback for nonmatching objects.
8. Depart when the task is complete.
9. Celebrate at the destination.
10. Generate the next task or return to room idle state.

## Difficulty Progression

Level 1:

* One requested object
* Two object choices
* Distinct colors
* Strong highlighting

Level 2:

* Two requested objects
* Three or four object choices
* Reduced highlighting

Level 3:

* Up to three requested objects
* Distractors of the same category or color
* Two possible destinations

## Forgiveness Rules

* A dropped object near the train should snap into place.
* Incorrect objects should bounce gently back.
* Incorrect objects should not trigger a harsh sound.
* After repeated difficulty, nonmatching objects may fade or move aside.
* The instruction should be repeatable at any time.

## Technical Challenges

* Object dragging in a 3D scene
* Touch raycasting
* Forgiving drop zones
* Inventory validation
* Procedural instruction generation
* Deterministic task creation
* Camera movement
* Animation sequencing
* Audio synchronization

---

# 8.2 Build-a-Critter Lab

## Purpose

Teach body parts, counting, symmetry, colors, and creative choice.

## Core Activity

The child creates a friendly creature by selecting and attaching large body parts.

Example sequence:

1. Choose a body.
2. Add two eyes.
3. Add a mouth.
4. Choose legs.
5. Choose a color or pattern.
6. Tap a button to bring the creature to life.

## Version 1 Learning Targets

* Identify eyes, mouth, legs, and body
* Count to two or three
* Explore symmetry
* Associate body parts with movement
* Make simple creative choices

## Scene Elements

* Central creature assembly platform
* Large body-part trays
* Attachment indicators
* Mirror or preview area
* Celebration stage
* Creature name display for adults, not required for the child

## Interaction Loop

1. Present one body-part category.
2. Demonstrate dragging or tapping.
3. Attach the chosen part automatically.
4. Name the part aloud.
5. Move to the next category.
6. Animate the completed creature.
7. Let the child tap the creature to trigger reactions.
8. Save the creature locally.

## Version 1 Creature System

The initial system should support:

* Three body shapes
* Three eye styles
* Three mouth styles
* Three leg styles
* Three base colors
* Several decorative patterns
* At least three creature reactions

## Attachment Model

Parts should attach through predefined sockets.

Example sockets:

```ts
type CritterSocket =
  | "eye-left"
  | "eye-right"
  | "mouth"
  | "leg-front-left"
  | "leg-front-right"
  | "leg-back-left"
  | "leg-back-right";
```

The first release does not require arbitrary skeletal generation. Parts may use predefined attachment transforms stored as metadata.

## Future Architecture Goal

The data model should support later addition of:

* Different numbers of legs
* Wings
* Tails
* Horns
* Procedural walking
* Runtime inverse kinematics
* Shareable creature codes

## Forgiveness Rules

* Parts should snap to their intended sockets.
* A child should not be required to align or rotate a part.
* Dropping a part anywhere near the creature should count.
* A placed part can be replaced by choosing another.
* There is no invalid creature.

## Technical Challenges

* Modular 3D assembly
* Socket metadata
* Part replacement
* Creature serialization
* Animation selection
* Local gallery persistence
* Deterministic thumbnails or previews

---

# 8.3 Little Garden

## Purpose

Teach cause and effect, basic plant needs, weather, and simple sequencing.

## Core Activity

The child helps a magical plant grow by providing sunlight and water.

A simple round may ask the child to:

1. Tap the cloud to make rain.
2. Tap the sun to provide light.
3. Watch the plant grow.
4. Help a small animal find food or shelter.

## Version 1 Learning Targets

* Plants need water
* Plants need light
* Actions can cause visible changes
* Basic order and repetition
* Weather concepts
* Emotional care and nurturing

## Scene Elements

* Garden bed
* One main magical plant
* Sun
* Rain cloud
* Watering can
* Small garden animal
* Day and night lighting states
* Growth-stage animations

## Simulation Model

The garden should use a small deterministic simulation.

Example state:

```ts
interface GardenState {
  water: number;
  light: number;
  growthStage: 0 | 1 | 2 | 3;
  isRaining: boolean;
  timeOfDay: "day" | "night";
  visitor: "none" | "butterfly" | "bee" | "bird";
}
```

The simulation should not create failure states. Excess water should create a playful puddle rather than harming the plant.

## Interaction Loop

1. Show a plant in an initial growth state.
2. Prompt for water or light.
3. Animate the selected environmental effect.
4. Update the simulation.
5. Grow the plant visibly.
6. Introduce a small animal visitor.
7. Celebrate full growth.
8. Reset with a new plant variation.

## Difficulty Progression

Level 1:

* Single requested action
* Strong highlight
* Immediate growth

Level 2:

* Two-step sequence
* Reduced highlighting
* Plant reacts differently to sun and water

Level 3:

* Choose the correct action from multiple environmental controls
* Introduce day and night
* Add a simple animal need

## Forgiveness Rules

* Every environmental interaction should produce an interesting response.
* Repeated tapping should be rate-limited without appearing broken.
* Incorrect sequencing should still produce positive feedback.
* The system should eventually guide the child toward the intended action.

## Technical Challenges

* Deterministic simulation
* Time-based animation
* Particle effects
* Lighting transitions
* State visualization
* Repeated-input throttling
* Hint generation
* Sequence tracking

---

# 8.4 Magic Shape Factory

## Purpose

Teach shapes, matching, sorting, size, and simple geometric composition.

## Core Activity

The child places shapes into a whimsical machine.

Example tasks:

* Put the circle in the round opening.
* Put the large square on the large platform.
* Find the two triangles.
* Combine two pieces to complete a picture.

## Version 1 Learning Targets

* Circle
* Square
* Triangle
* Basic size comparison
* Shape matching
* Sorting
* Visual composition

## Scene Elements

* Conveyor belt
* Large input tray
* Shape slots
* Friendly machine face
* Levers and lights
* Output chute
* Celebration object

## Interaction Loop

1. Present two to five shapes.
2. Speak the target instruction.
3. Start slow conveyor movement or keep items stationary for easier levels.
4. Let the child drag a shape into the machine.
5. Validate the shape.
6. Animate the machine processing it.
7. Produce a delightful output.
8. Continue until the task is complete.

## Version 1 Shape Model

```ts
type ShapeKind = "circle" | "square" | "triangle";
type ShapeSize = "small" | "large";

interface ShapeItem {
  id: string;
  kind: ShapeKind;
  size: ShapeSize;
  color: BasicColor;
}
```

## Puzzle Generation

Generated puzzles must be validated before presentation.

A puzzle generator should:

1. Select one learning target.
2. Generate a correct target.
3. Add a controlled number of distractors.
4. Verify that the instruction identifies at least one valid solution.
5. Verify that the requested count is achievable.
6. Reject ambiguous combinations unless ambiguity is intentional.

## Forgiveness Rules

* Drop zones must be much larger than their visible openings.
* Correct shapes should snap into the machine.
* Incorrect shapes should produce a playful machine reaction.
* After repeated attempts, the correct shape may wiggle or glow.
* Conveyor motion should stop when dragging begins.

## Technical Challenges

* Constraint-based generation
* Solvability validation
* Dragging moving objects
* Input locking during animations
* Machine state sequencing
* Visual regression testing
* Procedural task variation

---

# 8.5 Musical Corner

## Purpose

Teach sound matching, rhythm awareness, loud and soft, and high and low pitch.

## Core Activity

The child listens to a sound and taps the instrument or character that made it.

Alternative activity types may include:

* Repeat a two-beat rhythm
* Match identical sounds
* Choose loud or soft
* Choose high or low
* Tap instruments freely to make music

## Version 1 Learning Targets

* Sound-source matching
* Basic instrument recognition
* Loud versus soft
* High versus low
* Turn-taking
* Simple rhythm imitation

## Scene Elements

* Three large instruments
* Friendly stage characters
* Sound-replay button
* Visual pulse indicators
* Decorative lights
* Free-play mode button

## Version 1 Instruments

Use three strongly differentiated sounds, such as:

* Drum
* Bell
* Xylophone

Sounds must be:

* Short
* Clear
* Pleasant
* Distinct on tablet speakers
* Normalized to similar perceived loudness

## Interaction Loop

1. Dim or pause visual distractions.
2. Play one sound.
3. Present two or three possible instruments.
4. Let the child tap an instrument.
5. Animate and play the selected instrument.
6. Celebrate a match.
7. Gently replay the target after a mismatch.
8. Continue with a new sound.

## Audio Rules

* Spoken instructions and target sounds must not overlap.
* Repeated taps should not create an unintelligible wall of sound.
* Audio should use a scheduler or channel system.
* Important speech may duck background music.
* Background music should be optional and quiet.
* Sound playback must respect the global volume setting.

## Forgiveness Rules

* The replay button should always be available.
* Incorrect selections should still play their sound.
* After multiple attempts, reduce choices.
* Visual hints should not appear before the child has had time to listen.

## Technical Challenges

* Web Audio initialization
* Audio channel coordination
* Low-latency playback
* Sound normalization
* Playback interruption
* Rhythm timing
* Browser audio suspension recovery

---

## 9. Curriculum and Adaptive Difficulty

## 9.1 Curriculum Goals

The curriculum system determines:

* Which concept to practice
* Which room to suggest
* How difficult the next task should be
* When to repeat a task
* When to simplify a task
* Which hint to show

The system must not attempt to diagnose learning ability. It should only personalize immediate gameplay.

## 9.2 Skill Model

Each educational concept should have a lightweight local score.

```ts
type SkillId =
  | "count-1"
  | "count-2"
  | "count-3"
  | "color-red"
  | "color-blue"
  | "color-yellow"
  | "shape-circle"
  | "shape-square"
  | "shape-triangle"
  | "sound-match"
  | "high-low"
  | "loud-soft"
  | "body-parts"
  | "cause-effect"
  | "sequence-two-step";

interface SkillProgress {
  attempts: number;
  independentSuccesses: number;
  assistedSuccesses: number;
  recentDifficulty: number;
  lastPlayedAt?: number;
}
```

## 9.3 Difficulty Signals

The system may consider:

* Correct first attempt
* Correct after hint
* Number of unrelated interactions
* Time before first interaction
* Number of repeated instructions
* Number of mismatches
* Whether the task was abandoned

It should not infer emotional, cognitive, or medical characteristics.

## 9.4 Adaptation Rules

Possible simplifications:

* Reduce distractors
* Increase target size
* Highlight the target
* Repeat the spoken instruction
* Demonstrate the required gesture
* Pause moving objects
* Replace a two-step task with a one-step task

Possible increases in challenge:

* Add one distractor
* Reduce highlighting
* Add a second attribute
* Increase requested count
* Introduce a two-step sequence

Difficulty should change gradually.

## 9.5 Determinism

Activity generation must accept a seed.

```ts
interface ActivityGenerationContext {
  seed: string;
  roomId: RoomId;
  difficulty: number;
  enabledSkills: SkillId[];
}
```

Using a seed enables:

* Reproduction of bugs
* Predictable tests
* Shareable test scenarios
* Consistent screenshots
* Debugging of generated content

---

## 10. Interaction Design

## 10.1 Target Sizes

Interactive targets should be deliberately oversized.

Recommended minimum screen-space target:

* Approximately 64 CSS pixels on tablets
* Prefer 80 CSS pixels or larger for primary actions

Visible artwork may be smaller than the interaction collider.

## 10.2 Dragging

The drag system should:

* Start after a small movement threshold
* Preserve the initial object-to-pointer offset where practical
* Lift the object visually
* Reduce collision interference while dragging
* Project movement onto an interaction plane
* Clamp objects within a safe scene area
* Accept approximate drops
* Animate rejected objects back to their origin

## 10.3 Repeated Input

Young children may tap rapidly.

Every interactive system must account for:

* Duplicate taps
* Tap during animation
* Drag during transition
* Touch cancellation
* Pointer leaving the canvas
* Browser losing focus
* Orientation changes
* Audio context suspension

Interactions should be idempotent where possible.

## 10.4 Idle Assistance

If no meaningful interaction occurs:

* After a short delay, an object may wiggle.
* After another delay, a visual path or glow may appear.
* The instruction may repeat.
* A demonstration may play.
* Difficulty may simplify.

Idle assistance should stop immediately when the child interacts.

## 10.5 No Dead Ends

Every state must provide at least one of:

* A clear next interaction
* Automatic continuation
* Replay instruction
* Home button
* Reset activity button

---

## 11. Visual Direction

## 11.1 Style

The art direction should be:

* Soft
* Toy-like
* Rounded
* Colorful
* Friendly
* Readable
* Low in visual clutter

Avoid:

* Photorealism
* Sharp or threatening objects
* Dark horror-like lighting
* Fast flashing
* Excessive particle effects
* Highly reflective surfaces
* Visually noisy textures

## 11.2 3D Rendering Style

Recommended approach:

* Stylized low-poly geometry
* Soft shadows
* Baked or simplified lighting
* Limited material variety
* Moderate texture resolution
* Rounded silhouettes
* Subtle idle animations

## 11.3 Color Use

Color is educational content and should not be the only indicator of meaning.

When asking for a red object, also distinguish it through:

* Shape
* Position
* Spoken instruction
* Animation
* Optional outline

The application should remain usable for children with color-vision differences.

## 11.4 Camera

The camera should be controlled by the application.

The child should not need to orbit, pan, or zoom.

Camera movements should:

* Be slow and predictable
* Use easing
* Avoid sudden rotation
* Avoid motion that may cause discomfort
* Be reduced or replaced when reduced-motion mode is active

---

## 12. Audio Design

## 12.1 Audio Categories

Use separate logical channels:

```ts
type AudioChannel =
  | "speech"
  | "instruction"
  | "effect"
  | "music"
  | "ambient";
```

## 12.2 Priority

Suggested priority:

1. Safety or recovery messages
2. Instructions
3. Character speech
4. Educational target sounds
5. Success effects
6. Ambient sounds
7. Background music

Higher-priority audio may duck or interrupt lower-priority audio.

## 12.3 Spoken Instructions

Version 1 should use prerecorded voice clips where possible.

Advantages:

* Consistent pronunciation
* Child-friendly performance
* Predictable duration
* Offline availability
* Cross-browser consistency

Browser text-to-speech may be used as a development fallback, but it should not be required for the production experience.

## 12.4 Audio Initialization

Audio must be initialized after a user gesture.

The startup sequence should:

1. Wait for the Play button.
2. Create or resume the audio context.
3. Play a short silent or low-volume initialization sound if needed.
4. Confirm that the context is active.
5. Enter the playroom.

## 12.5 Captions and Visual Equivalents

The child experience cannot depend solely on sound.

Important audio events should have visual equivalents:

* Instrument pulse
* Character animation
* Object glow
* Speaker icon
* Repeated visual demonstration

---

## 13. Accessibility

## 13.1 Accessibility Goals

The application should support children with differences in:

* Motor control
* Hearing
* Vision
* Attention
* Sensory preferences

## 13.2 Required Settings

Version 1 should include:

* Master volume
* Music on or off
* Reduced motion
* Reduced particle effects
* High-contrast interaction outlines
* Longer hint delay
* Static camera transitions where practical

## 13.3 Keyboard Support

Although touch is primary, core controls should support keyboard navigation for testing and accessibility.

At minimum:

* Tab reaches global controls
* Enter or Space activates focused controls
* Escape returns from modal settings
* A debug mode may expose keyboard room selection

Dragging activities do not need a perfect keyboard equivalent in version 1, but important navigation must remain accessible.

## 13.4 DOM Accessibility

Canvas-based controls should have corresponding accessible DOM controls where practical.

For example:

* Home button
* Settings button
* Replay instruction
* Pause
* Start game

Decorative canvas objects do not all need DOM equivalents.

## 13.5 Reduced Motion

Reduced-motion mode should:

* Replace long camera moves with short fades
* Reduce bouncing
* Disable screen shake
* Reduce particle count
* Reduce repeated idle movement
* Preserve essential educational animation

---

## 14. Technical Architecture

## 14.1 Recommended Stack

* Vite
* TypeScript
* React
* React Three Fiber
* Three.js
* Zustand
* XState or a lightweight explicit state-machine layer
* Howler.js or a custom Web Audio wrapper
* IndexedDB through a small wrapper such as `idb`
* Vitest
* React Testing Library
* Playwright
* ESLint
* Prettier

Rapier may be used for selected physics interactions, but full-world physics should not be mandatory.

## 14.2 Architecture Goals

The codebase should:

* Separate game logic from rendering
* Keep generated activities deterministic
* Make room modules independently testable
* Avoid global mutable state
* Support lazy-loaded rooms
* Support asset preloading
* Recover from partial failures
* Allow content to be described as data
* Avoid coupling educational logic to 3D object names

## 14.3 Suggested Repository Structure

```text
carlys-magic-playroom/
├── public/
│   ├── icons/
│   ├── audio/
│   ├── models/
│   ├── textures/
│   └── manifest.webmanifest
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── AppRouter.tsx
│   │   ├── AppProviders.tsx
│   │   └── StartupScreen.tsx
│   ├── engine/
│   │   ├── audio/
│   │   ├── input/
│   │   ├── rendering/
│   │   ├── animation/
│   │   ├── assets/
│   │   ├── timing/
│   │   └── diagnostics/
│   ├── playroom/
│   │   ├── PlayroomScene.tsx
│   │   ├── RoomPortal.tsx
│   │   └── playroom.types.ts
│   ├── rooms/
│   │   ├── train/
│   │   ├── critter/
│   │   ├── garden/
│   │   ├── shapes/
│   │   └── music/
│   ├── curriculum/
│   │   ├── skill-model.ts
│   │   ├── activity-selector.ts
│   │   ├── difficulty.ts
│   │   └── curriculum.types.ts
│   ├── state/
│   │   ├── app-store.ts
│   │   ├── settings-store.ts
│   │   └── progress-store.ts
│   ├── persistence/
│   │   ├── database.ts
│   │   ├── migrations.ts
│   │   └── persistence.types.ts
│   ├── ui/
│   │   ├── controls/
│   │   ├── overlays/
│   │   ├── settings/
│   │   └── parent/
│   ├── content/
│   │   ├── colors.ts
│   │   ├── shapes.ts
│   │   ├── vocabulary.ts
│   │   └── instructions.ts
│   ├── testing/
│   │   ├── fixtures/
│   │   ├── seeds/
│   │   └── helpers/
│   ├── types/
│   └── main.tsx
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── visual/
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 14.4 Room Module Contract

Each room should implement a common contract.

```ts
interface RoomModule {
  id: RoomId;
  title: string;
  preload(): Promise<void>;
  createSession(context: RoomSessionContext): RoomSession;
  dispose(): void;
}
```

A room session should expose:

```ts
interface RoomSession {
  state: RoomSessionState;
  start(): void;
  pause(): void;
  resume(): void;
  restart(): void;
  exit(): void;
}
```

## 14.5 Game Logic and Rendering Separation

Core activity correctness must not depend on React components or Three.js objects.

Preferred separation:

```text
Activity generator
        ↓
Serializable activity definition
        ↓
Activity state machine
        ↓
Render adapter
        ↓
React Three Fiber scene
```

This makes it possible to test activity rules without WebGL.

---

## 15. State Management

## 15.1 State Categories

Separate state into:

### Persistent application state

* Settings
* Progress
* Saved creatures
* Completed introductions
* Content preferences

### Session state

* Current room
* Current generated activity
* Current activity phase
* Selected object
* Hint level
* Active audio
* Transition state

### Ephemeral rendering state

* Animation progress
* Pointer hover
* Particle instances
* Temporary transforms
* Frame timing

Ephemeral rendering state should not be placed in a global store unless necessary.

## 15.2 Activity State Machines

Each activity should use explicit states.

Example:

```ts
type ActivityPhase =
  | "loading"
  | "intro"
  | "instruction"
  | "waiting"
  | "evaluating"
  | "hint"
  | "celebrating"
  | "complete"
  | "paused"
  | "exiting"
  | "error";
```

Transitions should be documented and testable.

Unexpected events should be ignored or handled safely rather than causing invalid state.

## 15.3 Event Model

Example events:

```ts
type ActivityEvent =
  | { type: "START" }
  | { type: "INTRO_FINISHED" }
  | { type: "OBJECT_PICKED"; objectId: string }
  | { type: "OBJECT_DROPPED"; objectId: string; zoneId?: string }
  | { type: "INSTRUCTION_REPLAYED" }
  | { type: "HINT_TIMEOUT" }
  | { type: "CELEBRATION_FINISHED" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "EXIT" }
  | { type: "RECOVER" };
```

---

## 16. Persistence

## 16.1 Storage Technology

Use IndexedDB for structured persistent data.

Use localStorage only for:

* Tiny boot-time preferences
* Last known schema version
* Emergency fallback flags

## 16.2 Persistent Data Model

```ts
interface SaveData {
  schemaVersion: number;
  settings: PlayerSettings;
  progress: Record<SkillId, SkillProgress>;
  roomProgress: Record<RoomId, RoomProgress>;
  savedCritters: SavedCritter[];
  completedTutorials: string[];
  updatedAt: number;
}
```

## 16.3 Data Migrations

Every stored save must include a schema version.

The persistence layer should:

1. Read current data.
2. Validate its shape.
3. Apply migrations sequentially.
4. Back up or discard invalid sections.
5. Preserve settings when possible.
6. Continue with safe defaults if migration fails.

The game must not become unusable because of corrupted local data.

## 16.4 Reset Options

Parent settings should provide:

* Reset learning progress
* Delete saved creatures
* Reset settings
* Reset all local data

Destructive actions should require an adult-oriented confirmation interaction.

---

## 17. Parent Settings

## 17.1 Access

The parent area should not be visually prominent to the child.

A parent gate may use a simple adult-oriented task, such as:

* Hold a corner button for three seconds
* Solve a basic written prompt
* Enter a displayed sequence

The gate is not a security mechanism. It only reduces accidental access.

## 17.2 Settings

Version 1 settings:

* Master volume
* Music volume or toggle
* Speech volume
* Reduced motion
* Reduced effects
* Hint timing
* Enabled rooms
* Enabled learning categories
* Reset controls
* Build and diagnostic information

## 17.3 Progress Summary

A simple local summary may show:

* Recently played rooms
* Number of completed activities
* Concepts encountered
* Saved creatures

Avoid labels such as “behind,” “failed,” or “low ability.”

---

## 18. Asset Strategy

## 18.1 Asset Formats

Recommended formats:

* GLB or glTF for 3D models
* WebP or AVIF for raster images, with fallback where needed
* SVG for interface icons
* OGG and MP3 fallback for audio
* JSON for content metadata

## 18.2 Asset Budgets

Initial targets:

* Critical startup download: under 3 MB compressed
* Individual room bundle: preferably under 5 MB compressed
* Total first release: preferably under 30 MB compressed
* Maximum texture size: generally 1024×1024
* Prefer texture atlases and reused materials

These are targets rather than hard limits, but regressions should be visible in build reports.

## 18.3 Loading Strategy

Load assets in tiers.

### Tier 1

Required for:

* Startup screen
* Play button
* Basic UI
* Central room shell

### Tier 2

Required for:

* Central playroom
* Room portal animations

### Tier 3

Loaded lazily:

* Individual room assets
* Optional voice packs
* Decorative assets

## 18.4 Loading Failure

If a noncritical asset fails:

* Use a fallback material or primitive
* Continue the activity
* Record a local diagnostic event
* Avoid showing a technical error to the child

If a critical room asset fails:

* Show a friendly retry scene
* Provide Home and Retry controls
* Avoid blank screens

---

## 19. Performance Requirements

## 19.1 Target Devices

The application should aim to support:

* Modern desktop browsers
* Current and moderately old tablets
* Integrated graphics
* Midrange mobile hardware

## 19.2 Frame Rate

Targets:

* 60 frames per second on capable hardware
* Stable 30 frames per second minimum on lower-end supported devices

Stable frame pacing is more important than maximum visual quality.

## 19.3 Performance Techniques

Use:

* Lazy room loading
* Instancing for repeated objects
* Limited dynamic lights
* Simplified shadows
* Object pooling
* Texture reuse
* Frustum culling
* Suspense or explicit loading boundaries
* Adaptive pixel ratio
* Reduced effect quality on slower devices
* Minimal React state updates inside animation frames

Avoid:

* Recreating materials every render
* Excessive transparent layers
* High-poly models
* Large uncompressed audio
* Per-frame global store updates
* Full physics simulation for decorative objects

## 19.4 Adaptive Quality

Create quality levels such as:

```ts
type QualityLevel = "low" | "medium" | "high";
```

Possible adaptations:

* Pixel ratio
* Shadow resolution
* Particle count
* Ambient effects
* Postprocessing
* Number of decorative objects

Quality changes must not affect game logic.

---

## 20. Vite and GitHub Pages Requirements

## 20.1 Static Application Constraint

The production build must consist only of static files.

The application must not require:

* Node.js at runtime
* API routes
* Server redirects
* Environment secrets
* Database access
* Server sessions
* Dynamic HTML generation

## 20.2 Base Path

GitHub Pages commonly hosts project sites under a repository path.

The Vite base path must be configurable.

Example:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS
    ? "/carlys-magic-playroom/"
    : "/",
});
```

A more robust implementation may derive the repository name from an environment variable.

## 20.3 Routing

Avoid relying on server-side fallback routing.

Preferred options:

1. Use hash-based routing.
2. Use a single application route with internal state.
3. Avoid routes entirely for child-facing navigation.

If routes are used for diagnostics or parent pages, `HashRouter` is preferred.

Example:

```text
/#/
/#/room/train
/#/room/garden
/#/settings
```

## 20.4 Asset Paths

All asset references must respect the Vite base path.

Prefer:

```ts
const assetUrl = `${import.meta.env.BASE_URL}audio/train/duck.mp3`;
```

Avoid hardcoded root-relative URLs such as:

```ts
"/audio/train/duck.mp3"
```

## 20.5 GitHub Actions Deployment

The repository should include a workflow that:

1. Checks out the repository.
2. Installs dependencies with a locked package manager version.
3. Runs type checking.
4. Runs unit tests.
5. Builds the Vite application.
6. Uploads the static artifact.
7. Deploys to GitHub Pages.

A failed test or build must block deployment.

## 20.6 Development and Production Parity

The application must be tested under a non-root base path before release.

A local preview command or test should serve the build at a path resembling:

```text
/carlys-magic-playroom/
```

This prevents broken asset paths that only appear on GitHub Pages.

---

## 21. Progressive Web App Support

## 21.1 Goals

The application should be installable where supported and usable offline after initial loading.

## 21.2 Service Worker Rules

The service worker should:

* Cache hashed build assets
* Cache critical room assets
* Avoid caching invalid error responses
* Update safely
* Avoid trapping users on permanently stale versions
* Provide a recovery path if cache installation fails

## 21.3 Update Behavior

When a new version is available:

* Do not interrupt an active activity.
* Wait until the user returns to the hub or reloads.
* Apply the update automatically on the next safe startup.
* Parent diagnostics may display the installed build version.

## 21.4 Offline Limitations

All required production content must ship with the application.

Do not depend on:

* Remote font services
* Remote audio
* Third-party model hosts
* Runtime CDN imports
* External APIs

---

## 22. Error Handling and Recovery

## 22.1 Child-Facing Errors

Never show:

* Stack traces
* Raw error messages
* Browser-style dialogs
* Developer terminology
* Blank scenes

Use friendly recovery states with:

* A character reaction
* Retry button
* Home button
* Automatic reset where safe

## 22.2 Error Boundaries

Use error boundaries around:

* The full application
* Each room
* Parent settings
* Optional diagnostic panels

## 22.3 Watchdog Behavior

An activity watchdog may detect:

* Animation never completed
* State did not advance
* Required object missing
* Audio promise rejected
* Drag remained active after pointer cancellation

Recovery actions may include:

* Cancel active animations
* Reset object transforms
* Stop audio
* Restore the last stable activity state
* Restart the current round

## 22.4 Diagnostic Logging

Diagnostics should remain local.

Example categories:

```ts
type DiagnosticCategory =
  | "asset"
  | "audio"
  | "render"
  | "persistence"
  | "activity"
  | "performance";
```

Diagnostic records should:

* Avoid personal data
* Have a bounded storage size
* Be clearable
* Be viewable in parent or developer mode
* Be disabled or minimized in normal production use

---

## 23. Testing Strategy

## 23.1 Unit Tests

Unit-test:

* Puzzle generators
* Skill progression
* Difficulty adjustments
* State-machine transitions
* Drop validation
* Counting rules
* Audio priority decisions
* Persistence migrations
* Seeded random generation
* Activity solvability

## 23.2 Property-Based Testing

Property-based tests are strongly encouraged for procedural content.

Examples:

* Every generated request has at least one solution.
* Requested object counts never exceed available matching objects.
* A shape puzzle never asks for an unavailable shape.
* Generated distractors do not accidentally satisfy the same instruction unless allowed.
* Every state machine can reach a safe exit state.
* Every generated activity is serializable.

## 23.3 Component Tests

Test:

* Start screen
* Parent controls
* Volume settings
* Home button
* Replay instruction
* Loading states
* Error fallback
* Reduced-motion behavior

## 23.4 End-to-End Tests

Playwright scenarios should include:

1. Load the app under the GitHub Pages base path.
2. Start the game.
3. Enter each room.
4. Complete one activity.
5. Return to the hub.
6. Reload the page.
7. Verify saved progress.
8. Disable audio.
9. Enable reduced motion.
10. Simulate offline mode after initial load.
11. Simulate failed asset loading.
12. Verify the game provides a recovery path.

## 23.5 Touch Testing

Automated and manual tests should cover:

* Tap
* Drag
* Pointer cancellation
* Multiple rapid taps
* Drag outside the canvas
* Orientation change during activity
* Browser visibility change
* Long pause and resume

## 23.6 Visual Regression Testing

Use stable seeds and fixed viewport sizes for screenshots.

Capture:

* Central playroom
* Initial state of each room
* Hint state
* Success state
* Reduced-motion state
* Loading fallback
* Error fallback

Visual tests should use deterministic animation time or paused animation.

## 23.7 Performance Testing

Track:

* Initial bundle size
* Per-room bundle size
* Asset size
* Time to interactive
* Peak memory
* Frame-rate stability
* Number of draw calls
* Texture memory where practical

---

## 24. Developer and Model-Facing Requirements

The coding model should treat this document as the primary source of truth.

When requirements conflict, use this priority:

1. Child safety and usability
2. No-server deployment constraint
3. Correctness and recovery
4. Accessibility
5. Performance
6. Maintainability
7. Visual polish
8. Feature breadth

## 24.1 Required Engineering Behavior

Before implementing a major system, the coding model should:

1. Identify affected modules.
2. Describe the intended data flow.
3. Define interfaces and invariants.
4. Identify failure modes.
5. Write or update tests.
6. Implement the smallest complete vertical slice.
7. Verify production build behavior.
8. Update documentation.

## 24.2 Prohibited Engineering Shortcuts

Do not:

* Store core game state directly in Three.js objects.
* Couple puzzle correctness to visual object names.
* Use unseeded randomness in testable game logic.
* Hardcode GitHub Pages root paths.
* Depend on remote runtime services.
* Hide TypeScript errors with broad `any` types.
* Disable tests to complete a feature.
* Create inaccessible DOM overlays over the canvas.
* Allow multiple overlapping instruction sounds.
* Treat incorrect child input as exceptional.
* Put all rooms in one monolithic component.
* Load every room before showing the start screen.
* Introduce a backend for convenience.

## 24.3 Definition of Done for a Feature

A feature is complete when:

* It works with touch and mouse.
* It has a recovery path.
* It respects audio settings.
* It respects reduced motion.
* It does not break static deployment.
* It has appropriate automated tests.
* It handles repeated input.
* It cleans up timers, event listeners, audio, and animation resources.
* It works after browser refresh where applicable.
* It does not introduce console errors during normal play.
* Its public interfaces are documented.

---

## 25. Security and Privacy

## 25.1 General Policy

The application processes no sensitive personal data.

## 25.2 External Resources

Avoid third-party scripts.

Any dependency should be:

* Installed at build time
* Bundled locally
* Reviewed for necessity
* Compatible with static hosting

## 25.3 Content Security

Where practical, configure a restrictive content security policy through a meta tag or GitHub Pages-compatible headers strategy.

The application should not use:

* `eval`
* Runtime code downloaded from external origins
* Unsanitized HTML injection
* Untrusted user-generated content

## 25.4 Save Data

Save data must contain only game configuration and progress.

Do not store:

* Names
* Birth dates
* Email addresses
* Location
* Device identifiers
* Audio recordings
* Free-form user text

---

## 26. Localization Readiness

Version 1 may ship in one language, but content should be structured for future localization.

Do not embed instruction strings directly in room logic.

Preferred structure:

```ts
interface InstructionTemplate {
  id: string;
  textKey: string;
  audioKey: string;
  parameters: Record<string, string | number>;
}
```

Future localization should support:

* Translated text
* Language-specific audio
* Different word ordering
* Pluralization
* Different color or object vocabulary

Audio asset selection should be language-aware.

---

## 27. Content Data Model

## 27.1 Basic Colors

```ts
type BasicColor =
  | "red"
  | "blue"
  | "yellow"
  | "green"
  | "purple"
  | "orange";
```

Version 1 activities should initially emphasize:

* Red
* Blue
* Yellow

Additional colors may appear in free play.

## 27.2 Educational Object Metadata

```ts
interface EducationalObjectDefinition {
  id: string;
  category: string;
  displayNameKey: string;
  audioNameKey: string;
  colors: BasicColor[];
  countable: boolean;
  modelAssetId: string;
  thumbnailAssetId?: string;
  tags: string[];
}
```

## 27.3 Activity Definition

```ts
interface ActivityDefinition {
  id: string;
  roomId: RoomId;
  seed: string;
  skills: SkillId[];
  difficulty: number;
  instruction: InstructionTemplate;
  objects: ActivityObjectDefinition[];
  successConditions: SuccessCondition[];
  hintPlan: HintStep[];
}
```

This definition must be serializable.

---

## 28. Analytics Without Tracking

No remote analytics should be included.

For development, the application may expose local counters such as:

* Room entered
* Activity started
* Activity completed
* Hint shown
* Activity reset
* Asset failed
* Average frame time

These counters should:

* Remain local
* Be removable
* Avoid identifying the user
* Be disabled in ordinary child-facing views

---

## 29. Milestones

# Milestone 0: Repository Foundation

Deliver:

* Vite application
* TypeScript strict mode
* React setup
* Linting and formatting
* Unit testing
* Playwright setup
* GitHub Actions
* GitHub Pages deployment
* Configurable base path
* Basic error boundary
* Build information display

Acceptance criteria:

* Production build succeeds.
* Tests run in CI.
* The app loads from a repository subpath.
* Refreshing does not produce broken asset paths.
* No server process is required.

# Milestone 1: Playroom Vertical Slice

Deliver:

* Startup screen
* Audio initialization
* Central playroom shell
* One selectable room portal
* Camera transition
* Home navigation
* Loading fallback
* Reduced-motion transition

Acceptance criteria:

* A child can start the app and enter and exit one room.
* Repeated tapping does not break navigation.
* Audio starts only after user interaction.
* The production build works on GitHub Pages.

# Milestone 2: Tiny Delivery Train

Deliver:

* One complete train activity
* Drag-and-drop
* Counting
* Color matching
* Seeded activity generation
* Spoken instructions
* Hint sequence
* Celebration
* Progress storage
* Automated logic tests

Acceptance criteria:

* Generated tasks are always solvable.
* The child can complete the activity without reading.
* Invalid drops recover safely.
* Refreshing preserves progress.
* The activity works with touch and mouse.

# Milestone 3: Shared Activity Framework

Deliver:

* Common room contract
* Shared activity state machine patterns
* Shared instruction system
* Shared hint engine
* Shared audio channels
* Shared draggable-object behavior
* Diagnostic mode
* Persistence migrations

Acceptance criteria:

* The train room uses the common framework.
* A mock room can be created with minimal boilerplate.
* Shared systems have unit tests.

# Milestone 4: Remaining Four Rooms

Deliver:

* Build-a-Critter Lab
* Little Garden
* Magic Shape Factory
* Musical Corner

Acceptance criteria:

* Each room has one complete replayable activity.
* Each room saves relevant local progress.
* Each room handles repeated input and interruption.
* Each room can be lazy-loaded.
* Each room has deterministic test scenarios.

# Milestone 5: Parent Controls and Accessibility

Deliver:

* Parent gate
* Settings
* Volume control
* Reduced motion
* Reduced effects
* Room enablement
* Progress summary
* Data reset
* Keyboard-accessible global controls

Acceptance criteria:

* Settings persist.
* Reduced-motion mode affects all rooms.
* Disabled rooms are not suggested.
* Reset actions work safely.

# Milestone 6: Offline and Performance

Deliver:

* Service worker
* Installable manifest
* Offline asset cache
* Adaptive quality
* Bundle reporting
* Performance diagnostics
* Asset optimization

Acceptance criteria:

* The game launches offline after a successful initial load.
* The application remains usable if the service worker fails.
* Each room loads independently.
* Performance targets are met on agreed test devices.

# Milestone 7: Release Hardening

Deliver:

* Full end-to-end test suite
* Visual regression suite
* Error recovery audit
* Accessibility audit
* Privacy audit
* Dependency audit
* Documentation
* Release checklist

Acceptance criteria:

* No known critical dead ends.
* No normal-flow console errors.
* All five rooms are completable.
* GitHub Pages deployment is reproducible.
* Save migration and reset have been tested.
* Offline mode has been tested.
* Child-facing screens contain no technical error text.

---

## 30. Version 1 Acceptance Criteria

The first public version is complete when all of the following are true:

### Product

* Carly’s Magic Playroom has a central playroom and five rooms.
* Each room contains one educational activity.
* A child can navigate without reading.
* No activity uses punitive failure.
* Every activity has replay and recovery behavior.

### Technical

* The app is built with Vite and TypeScript.
* The app runs entirely in the browser.
* The app uses no backend services.
* The production build deploys to GitHub Pages.
* All paths work beneath a repository base URL.
* Progress is stored locally.
* The app can function offline after initial loading.
* Rooms are lazy-loaded.
* Activity generation is deterministic where applicable.

### Quality

* Critical game logic has automated tests.
* Core user journeys have end-to-end tests.
* Repeated touch input does not break activities.
* Settings persist.
* Reduced-motion mode is supported.
* Failed assets produce recoverable states.
* The game does not show raw errors to the child.
* Audio does not overlap unintelligibly.
* The app performs acceptably on the selected tablet test device.

---

## 31. Future Expansion

The architecture should permit future additions such as:

* More activities within each room
* Additional playroom wings
* Seasonal visual themes
* More languages
* Additional creature parts
* More complex train routes
* Expanded garden ecosystems
* Rhythm composition
* Printable activity sheets
* Local multi-profile support
* Shareable deterministic activity codes
* A local content editor
* Teacher mode
* Classroom kiosk mode

Future features must remain optional modules and must not force the version 1 application to adopt a server.

---

## 32. Initial Implementation Recommendation

The first implemented vertical slice should be the Tiny Delivery Train.

The first complete scenario should be:

> The play area contains five toys. Carly asks the child to put two yellow ducks into the train car. The child drags the ducks into oversized drop zones. Each duck is counted aloud. The train departs, arrives at a colorful destination, and triggers a short celebration.

This scenario exercises:

* Application startup
* 3D rendering
* Asset loading
* Audio initialization
* Spoken instructions
* Touch input
* Drag-and-drop
* Snapping
* Counting
* Color and category matching
* State machines
* Animation sequencing
* Hint behavior
* Celebration
* Local progress
* Recovery
* Testing
* Static deployment

It should be treated as the architectural proof of concept. The remaining rooms should not be implemented until this vertical slice is polished, tested, and successfully deployed to GitHub Pages.

---

## 33. Final Product Statement

Carly’s Magic Playroom is not intended to test whether a coding model can quickly generate a visually impressive demo.

It is intended to test whether the model can design, implement, verify, and maintain a coherent interactive application with:

* Strict deployment constraints
* Young-child usability requirements
* Multiple coordinated technical systems
* Procedural but valid content
* Robust recovery behavior
* Long-term extensibility
* High standards for privacy and accessibility

The game should feel effortless to the child because the engineering beneath it is deliberate, defensive, modular, and thoroughly tested.
