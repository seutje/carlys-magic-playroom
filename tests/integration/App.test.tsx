import { render, screen } from "@testing-library/react";

import { App } from "../../src/app/App";

describe("App", () => {
  it("renders the branded application shell", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Carly's Magic Playroom" })).toBeInTheDocument();
    expect(screen.queryByText("Build diagnostics")).not.toBeInTheDocument();
  });
});
