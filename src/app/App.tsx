import { BuildDiagnostics } from "../engine/diagnostics/BuildDiagnostics";

export function App() {
  return (
    <main className="app-shell">
      <section className="welcome-card" aria-labelledby="app-title">
        <div className="star" aria-hidden="true">
          ★
        </div>
        <p className="eyebrow">A little magic is growing</p>
        <h1 id="app-title">Carly&apos;s Magic Playroom</h1>
        <p className="welcome-copy">A warm place to tap, play, and discover.</p>
      </section>
      <BuildDiagnostics />
    </main>
  );
}
