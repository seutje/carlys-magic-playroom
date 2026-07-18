import type { RoomModule } from "../roomModule";
import { BasicRoomSession } from "../roomSession";
import { MusicRoom } from "./MusicRoom";

export const musicRoom: RoomModule = {
  id: "music",
  title: "Musical Corner",
  capabilities: { audio: true, drag: false, persistence: true, pause: false, restart: true },
  preload: () => Promise.resolve(),
  createSession: () => new BasicRoomSession(`music:${crypto.randomUUID()}`),
  Component: MusicRoom,
};
