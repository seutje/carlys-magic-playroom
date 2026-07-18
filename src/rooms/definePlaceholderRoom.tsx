import { PlaceholderRoom } from "./PlaceholderRoom";
import type { RoomModule } from "./roomModule";
import { BasicRoomSession } from "./roomSession";

export function definePlaceholderRoom(
  definition: Pick<RoomModule, "id" | "title"> & {
    readonly symbol: string;
    readonly color: string;
    readonly instruction: string;
  },
): RoomModule {
  return {
    id: definition.id,
    title: definition.title,
    capabilities: {
      audio: false,
      drag: false,
      persistence: false,
      pause: false,
      restart: false,
    },
    preload: () => Promise.resolve(),
    createSession: () => new BasicRoomSession(`${definition.id}:${crypto.randomUUID()}`),
    Component: (props) => <PlaceholderRoom {...props} {...definition} />,
  };
}
