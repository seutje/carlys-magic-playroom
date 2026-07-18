import { BasicRoomSession } from "../../src/rooms/roomSession";
import { exerciseRoomLifecycle } from "../../src/testing/helpers";

describe("BasicRoomSession", () => {
  it("guards lifecycle transitions and disposes resources exactly once", () => {
    const restart = vi.fn();
    const dispose = vi.fn();
    const session = new BasicRoomSession("mock", restart, dispose);

    session.pause();
    expect(session.phase).toBe("ready");
    exerciseRoomLifecycle(session);
    expect(restart).toHaveBeenCalledOnce();
    session.dispose();
    expect(session.phase).toBe("disposed");
    expect(dispose).toHaveBeenCalledOnce();
  });
});
