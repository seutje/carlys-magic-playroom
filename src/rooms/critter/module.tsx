import type { RoomModule } from "../roomModule";
import { BasicRoomSession } from "../roomSession";
import { CritterRoom } from "./CritterRoom";

export const critterRoom: RoomModule = {
  id: "critter",
  title: "Build-a-Critter Lab",
  capabilities: { audio: true, drag: false, persistence: true, pause: true, restart: true },
  preload: () => Promise.resolve(),
  createSession: () => new BasicRoomSession(`critter:${crypto.randomUUID()}`),
  Component: CritterRoom,
};
