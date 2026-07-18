import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { StartupScreen } from "../../src/app/StartupScreen";

describe("StartupScreen", () => {
  it("offers one large keyboard-accessible Play action when ready", async () => {
    const user = userEvent.setup();
    const onPlay = vi.fn();
    render(
      <StartupScreen status="ready" audioAvailability="idle" onPlay={onPlay} onRetry={vi.fn()} />,
    );

    const play = screen.getByRole("button", { name: "Play" });
    play.focus();
    await user.keyboard("{Enter}");
    expect(onPlay).toHaveBeenCalledOnce();
  });

  it("shows loading and friendly retry states without disabling an available action", () => {
    const { rerender } = render(
      <StartupScreen
        status="loading"
        audioAvailability="idle"
        onPlay={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Opening the playroom");

    rerender(
      <StartupScreen
        status="error"
        audioAvailability="unavailable"
        onPlay={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("another little tap");
    expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled();
  });
});
