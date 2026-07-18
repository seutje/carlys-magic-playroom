import type { ComponentType } from "react";

import type { RoomId } from "../types/domain";

export interface RoomComponentProps {
  readonly onReplayInstruction: () => void;
}

export interface RoomModule {
  readonly id: RoomId;
  readonly title: string;
  readonly Component: ComponentType<RoomComponentProps>;
}

export type RoomModuleLoader = () => Promise<RoomModule>;
