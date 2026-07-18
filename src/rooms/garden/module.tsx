import type { RoomModule } from "../roomModule";
import { BasicRoomSession } from "../roomSession";
import { GardenRoom } from "./GardenRoom";

export const gardenRoom: RoomModule = {
  id: "garden",
  title: "Little Garden",
  capabilities: { audio: true, drag: false, persistence: true, pause: true, restart: true },
  preload: () => Promise.resolve(),
  createSession: () => new BasicRoomSession(`garden:${crypto.randomUUID()}`),
  Component: GardenRoom,
};
