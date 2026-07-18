import type { AudioAvailability } from "../engine/audio/audioService";

interface StartupScreenProps {
  readonly status: "loading" | "ready" | "error";
  readonly audioAvailability: AudioAvailability;
  readonly onPlay: () => void;
  readonly onRetry: () => void;
}

export function StartupScreen({ status, audioAvailability, onPlay, onRetry }: StartupScreenProps) {
  return (
    <main className="app-shell startup-screen">
      <section className="welcome-card" aria-labelledby="app-title">
        <div className="star" aria-hidden="true">
          ★
        </div>
        <p className="eyebrow">A little magic is growing</p>
        <h1 id="app-title">Carly&apos;s Magic Playroom</h1>
        {status === "loading" ? (
          <p className="startup-message" role="status">
            Opening the playroom…
          </p>
        ) : null}
        {status === "ready" ? (
          <button className="play-button" type="button" onClick={onPlay}>
            <span aria-hidden="true">▶</span> Play
          </button>
        ) : null}
        {status === "error" ? (
          <div className="startup-retry" role="alert">
            <p>The door needs another little tap.</p>
            <button type="button" onClick={onRetry}>
              Try again
            </button>
          </div>
        ) : null}
        {audioAvailability === "unavailable" ? (
          <p className="gentle-notice" role="status">
            Pictures and play are ready. Sound can rest for now.
          </p>
        ) : null}
      </section>
    </main>
  );
}
