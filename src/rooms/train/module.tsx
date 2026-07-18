import { PlaceholderRoom } from "../PlaceholderRoom";
import type { RoomModule } from "../roomModule";

export const trainRoom: RoomModule = {
  id: "train",
  title: "Tiny Delivery Train",
  Component: (props) => (
    <PlaceholderRoom
      {...props}
      title="Tiny Delivery Train"
      symbol="🚂"
      color="#ef6b62"
      instruction="The train is getting ready!"
    />
  ),
};
