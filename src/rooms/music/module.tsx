import { PlaceholderRoom } from "../PlaceholderRoom";
import type { RoomModule } from "../roomModule";

export const musicRoom: RoomModule = {
  id: "music",
  title: "Musical Corner",
  Component: (props) => (
    <PlaceholderRoom
      {...props}
      title="Musical Corner"
      symbol="♫"
      color="#4f8fc5"
      instruction="The instruments are tuning up!"
    />
  ),
};
