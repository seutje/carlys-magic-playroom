import type { RoomModule } from "../roomModule";
import { BasicRoomSession } from "../roomSession";
import { ShapeFactoryRoom } from "./ShapeFactoryRoom";

export const shapesRoom: RoomModule = {
  id: "shapes",
  title: "Magic Shape Factory",
  capabilities: { audio: true, drag: true, persistence: true, pause: true, restart: true },
  preload: () => Promise.resolve(),
  createSession: () => new BasicRoomSession(`shapes:${crypto.randomUUID()}`),
  Component: ShapeFactoryRoom,
};
