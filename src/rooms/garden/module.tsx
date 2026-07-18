import { PlaceholderRoom } from "../PlaceholderRoom";
import type { RoomModule } from "../roomModule";

export const gardenRoom: RoomModule = {
  id: "garden",
  title: "Little Garden",
  Component: (props) => (
    <PlaceholderRoom
      {...props}
      title="Little Garden"
      symbol="🌻"
      color="#55a965"
      instruction="The little seeds are waking up!"
    />
  ),
};
