import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";

import { RoomHost } from "../../src/rooms/RoomHost";
import type { RoomModuleLoader } from "../../src/rooms/roomModule";

describe("RoomHost", () => {
  it("loads a room asynchronously and disposes its mounted lifecycle", async () => {
    const dispose = vi.fn();
    const loader: RoomModuleLoader = () =>
      Promise.resolve({
        id: "train",
        title: "Test Train",
        Component: () => {
          useEffect(() => dispose, []);
          return <h1>Test Train</h1>;
        },
      });

    const { unmount } = render(
      <RoomHost roomId="train" loader={loader} onHome={vi.fn()} replayRequest={0} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Gathering room magic");
    expect(await screen.findByRole("heading", { name: "Test Train" })).toBeInTheDocument();
    unmount();
    expect(dispose).toHaveBeenCalledOnce();
  });

  it("offers Retry and Home when loading fails", async () => {
    const user = userEvent.setup();
    const onHome = vi.fn();
    const loader = vi.fn<RoomModuleLoader>().mockRejectedValue(new Error("technical"));
    render(<RoomHost roomId="train" loader={loader} onHome={onHome} replayRequest={0} />);

    expect(await screen.findByRole("alert")).not.toHaveTextContent("technical");
    await user.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(2));
    await user.click(screen.getByRole("button", { name: "Go home" }));
    expect(onHome).toHaveBeenCalledOnce();
  });
});
