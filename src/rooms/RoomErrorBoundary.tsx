import { Component, type ErrorInfo, type ReactNode } from "react";

import { diagnostics } from "../engine/diagnostics/diagnostics";

interface RoomErrorBoundaryProps {
  readonly children: ReactNode;
  readonly onHome: () => void;
  readonly onRetry: () => void;
}

interface RoomErrorBoundaryState {
  readonly failed: boolean;
}

export class RoomErrorBoundary extends Component<RoomErrorBoundaryProps, RoomErrorBoundaryState> {
  public state: RoomErrorBoundaryState = { failed: false };

  public static getDerivedStateFromError(): RoomErrorBoundaryState {
    return { failed: true };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    diagnostics.record({ category: "render", code: "room-render-failed" });
    if (import.meta.env.DEV) console.error(error, info.componentStack);
  }

  public render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="room-recovery" role="alert">
        <div aria-hidden="true">✨</div>
        <h1>This room needs a little magic.</h1>
        <p>We can try once more or visit the playroom.</p>
        <div className="recovery-actions">
          <button
            type="button"
            onClick={() => {
              this.setState({ failed: false });
              this.props.onRetry();
            }}
          >
            Try again
          </button>
          <button type="button" onClick={this.props.onHome}>
            Go home
          </button>
        </div>
      </section>
    );
  }
}
