import type { ActivityPhase } from "../../engine/activity/activityState";

export const CRITTER_SOCKET_IDS = ["eyes", "mouth", "legs"] as const;
export type CritterSocketId = (typeof CRITTER_SOCKET_IDS)[number];
export type CritterColor = "lavender" | "mint" | "peach";
export type CritterPattern = "plain" | "spots" | "stripes";
export type CritterReaction = "wave" | "bounce" | "sparkle";

export interface CritterBodyDefinition {
  readonly id: "round" | "tall";
  readonly sockets: readonly CritterSocketId[];
}

export interface CritterPartDefinition {
  readonly id:
    | "eyes-round"
    | "eyes-star"
    | "mouth-smile"
    | "mouth-o"
    | "legs-bouncy"
    | "legs-stompy"
    | "legs-tall";
  readonly socketId: CritterSocketId;
  readonly compatibleBodies: readonly CritterBodyDefinition["id"][];
  readonly symbol: string;
}

export interface SavedCreature {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly bodyId: CritterBodyDefinition["id"];
  readonly color: CritterColor;
  readonly pattern: CritterPattern;
  readonly parts: Readonly<Record<CritterSocketId, CritterPartDefinition["id"]>>;
  readonly reaction: CritterReaction;
  readonly savedAt: number;
}

export interface CritterAssemblyState {
  readonly phase: ActivityPhase;
  readonly bodyId: CritterBodyDefinition["id"];
  readonly color: CritterColor;
  readonly pattern: CritterPattern;
  readonly parts: Readonly<Partial<Record<CritterSocketId, CritterPartDefinition["id"]>>>;
  readonly activeSocket: CritterSocketId;
  readonly hintLevel: 0 | 1 | 2;
  readonly reaction?: CritterReaction | undefined;
  readonly feedback: "ready" | "attached" | "replaced" | "incompatible" | "celebrating";
  readonly pausedFrom?: ActivityPhase | undefined;
}

export type CritterAssemblyEvent =
  | { readonly type: "SELECT_BODY"; readonly bodyId: CritterBodyDefinition["id"] }
  | { readonly type: "SELECT_COLOR"; readonly color: CritterColor }
  | { readonly type: "SELECT_PATTERN"; readonly pattern: CritterPattern }
  | { readonly type: "SELECT_PART"; readonly partId: CritterPartDefinition["id"] }
  | { readonly type: "INTRO_FINISHED" }
  | { readonly type: "CELEBRATION_FINISHED" }
  | { readonly type: "REACT"; readonly reaction: CritterReaction }
  | { readonly type: "REACTION_FINISHED" }
  | { readonly type: "HINT_TIMEOUT" }
  | { readonly type: "RESET" }
  | { readonly type: "PAUSE" }
  | { readonly type: "RESUME" }
  | { readonly type: "EXIT" }
  | { readonly type: "FAIL" }
  | { readonly type: "RECOVER" };
