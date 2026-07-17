import { Component, type ErrorInfo, type ReactNode } from "react";

import { diagnostics } from "../engine/diagnostics/diagnostics";

interface RootErrorBoundaryProps {
  children: ReactNode;
}

interface RootErrorBoundaryState {
  hasError: boolean;
}

/** Keeps render failures child-safe and gives the family a route back to play. */
export class RootErrorBoundary extends Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  public state: RootErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): RootErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    diagnostics.record({ category: "render", code: "root-render-failed" });
    if (import.meta.env.DEV) console.error(error, info.componentStack);
  }

  public render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="app-shell">
        <section className="welcome-card recovery" role="alert">
          <div className="star resting" aria-hidden="true">
            ★
          </div>
          <h1>The playroom needs a little rest.</h1>
          <p>Let&apos;s open the doors again.</p>
          <div className="recovery-actions">
            <button type="button" onClick={() => this.setState({ hasError: false })}>
              Try again
            </button>
            <button type="button" onClick={() => window.location.reload()}>
              Start over
            </button>
          </div>
        </section>
      </main>
    );
  }
}
