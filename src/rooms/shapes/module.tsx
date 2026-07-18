import { PlaceholderRoom } from "../PlaceholderRoom";
import type { RoomModule } from "../roomModule";

export const shapesRoom: RoomModule = {
  id: "shapes",
  title: "Magic Shape Factory",
  Component: (props) => (
    <PlaceholderRoom
      {...props}
      title="Magic Shape Factory"
      symbol="🔷"
      color="#e88b3d"
      instruction="The shape machine is warming up!"
    />
  ),
};
