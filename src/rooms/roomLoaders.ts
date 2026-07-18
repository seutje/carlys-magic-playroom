import type { RoomId } from "../types/domain";
import type { RoomModuleLoader } from "./roomModule";

export const ROOM_LOADERS: Readonly<Record<RoomId, RoomModuleLoader>> = {
  train: () => import("./train/module").then(({ trainRoom }) => trainRoom),
  critter: () => import("./critter/module").then(({ critterRoom }) => critterRoom),
  garden: () => import("./garden/module").then(({ gardenRoom }) => gardenRoom),
  shapes: () => import("./shapes/module").then(({ shapesRoom }) => shapesRoom),
  music: () => import("./music/module").then(({ musicRoom }) => musicRoom),
};
