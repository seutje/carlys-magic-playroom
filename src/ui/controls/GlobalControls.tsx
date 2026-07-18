interface GlobalControlsProps {
  readonly onHome: () => void;
  readonly onReplay: () => void;
  readonly onSettings: () => void;
  readonly homeDisabled?: boolean;
  readonly settingsButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export function GlobalControls({
  onHome,
  onReplay,
  onSettings,
  homeDisabled = false,
  settingsButtonRef,
}: GlobalControlsProps) {
  return (
    <nav className="global-controls" aria-label="Playroom controls">
      <button type="button" disabled={homeDisabled} aria-label="Go home" onClick={onHome}>
        <span aria-hidden="true">⌂</span>
      </button>
      <button type="button" aria-label="Replay instruction" onClick={onReplay}>
        <span aria-hidden="true">↻</span>
      </button>
      <button ref={settingsButtonRef} type="button" aria-label="Open settings" onClick={onSettings}>
        <span aria-hidden="true">⚙</span>
      </button>
    </nav>
  );
}
