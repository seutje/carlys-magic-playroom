import { PlaceholderRoom } from "../PlaceholderRoom";
import type { RoomModule } from "../roomModule";

export const critterRoom: RoomModule = {
  id: "critter",
  title: "Build-a-Critter Lab",
  Component: (props) => (
    <PlaceholderRoom
      {...props}
      title="Build-a-Critter Lab"
      symbol="🐾"
      color="#8268c8"
      instruction="The critters are gathering their parts!"
    />
  ),
};
