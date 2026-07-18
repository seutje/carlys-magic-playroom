import type { RoomModule } from "../roomModule";
import { TrainRoom } from "./TrainRoom";

export const trainRoom: RoomModule = {
  id: "train",
  title: "Tiny Delivery Train",
  Component: TrainRoom,
};
