import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RootErrorBoundary } from "../../src/app/RootErrorBoundary";

function BrokenChild(): never {
  throw new Error("technical detail that must remain hidden");
}

describe("RootErrorBoundary", () => {
  it("shows a child-safe retry without exposing technical details", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const user = userEvent.setup();

    render(
      <RootErrorBoundary>
        <BrokenChild />
      </RootErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("needs a little rest");
    expect(screen.queryByText(/technical detail/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start over" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
