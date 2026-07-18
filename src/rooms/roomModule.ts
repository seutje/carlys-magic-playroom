import type { ComponentType } from "react";

import type { RoomId } from "../types/domain";
import type { RoomSession } from "./roomSession";

export interface RoomComponentProps {
  readonly replayRequest: number;
  readonly session: RoomSession;
}

export interface RoomCapabilities {
  readonly audio: boolean;
  readonly drag: boolean;
  readonly persistence: boolean;
  readonly pause: boolean;
  readonly restart: boolean;
}

export interface RoomModule {
  readonly id: RoomId;
  readonly title: string;
  readonly capabilities: RoomCapabilities;
  preload(): Promise<void>;
  createSession(): RoomSession;
  readonly Component: ComponentType<RoomComponentProps>;
}

export type RoomModuleLoader = () => Promise<RoomModule>;
