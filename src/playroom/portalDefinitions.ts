import type { RoomId } from "../types/domain";

export interface PortalDefinition {
  readonly id: RoomId;
  readonly letter: "C" | "A" | "R" | "L" | "Y";
  readonly title: string;
  readonly spokenLabel: string;
  readonly color: string;
  readonly accent: string;
  readonly position: readonly [number, number, number];
  readonly symbol: string;
}

export const PORTALS: readonly PortalDefinition[] = [
  {
    id: "train",
    letter: "C",
    title: "Tiny Delivery Train",
    spokenLabel: "Play with the train",
    color: "#ef6b62",
    accent: "#ffd45e",
    position: [-4.2, 0.2, 0],
    symbol: "🚂",
  },
  {
    id: "critter",
    letter: "A",
    title: "Build-a-Critter Lab",
    spokenLabel: "Build a critter",
    color: "#8268c8",
    accent: "#f59dda",
    position: [-2.1, 0.2, -0.4],
    symbol: "🐾",
  },
  {
    id: "garden",
    letter: "R",
    title: "Little Garden",
    spokenLabel: "Visit the garden",
    color: "#55a965",
    accent: "#f7d660",
    position: [0, 0.2, 0],
    symbol: "🌻",
  },
  {
    id: "shapes",
    letter: "L",
    title: "Magic Shape Factory",
    spokenLabel: "Visit the shape factory",
    color: "#e88b3d",
    accent: "#62c8dc",
    position: [2.1, 0.2, -0.4],
    symbol: "🔷",
  },
  {
    id: "music",
    letter: "Y",
    title: "Musical Corner",
    spokenLabel: "Make some music",
    color: "#4f8fc5",
    accent: "#ee86a8",
    position: [4.2, 0.2, 0],
    symbol: "♫",
  },
] as const;

export function getPortal(roomId: RoomId): PortalDefinition {
  const portal = PORTALS.find((candidate) => candidate.id === roomId);
  if (!portal) throw new Error(`Missing portal definition for ${roomId}`);
  return portal;
}
