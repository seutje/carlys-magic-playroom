import { fireEvent, render, screen } from "@testing-library/react";

import { ParentGate } from "../../src/ui/settings/ParentGate";

describe("ParentGate", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("requires a sustained pointer hold and always offers cancel", () => {
    const unlock = vi.fn();
    const cancel = vi.fn();
    render(<ParentGate onUnlock={unlock} onCancel={cancel} />);
    const hold = screen.getByRole("button", { name: "Hold for grown-up controls" });
    fireEvent.pointerDown(hold);
    vi.advanceTimersByTime(1_799);
    expect(unlock).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(unlock).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Back to play" }));
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("cancels an interrupted hold and supports Escape", () => {
    const unlock = vi.fn();
    const cancel = vi.fn();
    render(<ParentGate onUnlock={unlock} onCancel={cancel} />);
    const hold = screen.getByRole("button", { name: "Hold for grown-up controls" });
    fireEvent.pointerDown(hold);
    vi.advanceTimersByTime(900);
    fireEvent.pointerUp(hold);
    vi.advanceTimersByTime(2_000);
    expect(unlock).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(cancel).toHaveBeenCalledOnce();
  });
});
