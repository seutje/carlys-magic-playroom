import type { RoomModule } from "../roomModule";
import { BasicRoomSession } from "../roomSession";
import { TrainRoom } from "./TrainRoom";

export const trainRoom: RoomModule = {
  id: "train",
  title: "Tiny Delivery Train",
  capabilities: { audio: true, drag: true, persistence: true, pause: true, restart: true },
  preload: () => Promise.resolve(),
  createSession: () => new BasicRoomSession(`train:${crypto.randomUUID()}`),
  Component: TrainRoom,
};
