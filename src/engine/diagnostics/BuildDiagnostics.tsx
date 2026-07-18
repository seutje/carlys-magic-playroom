import { useEffect, useState } from "react";

import { useQuality } from "../rendering/qualityContext";
import { buildMetadata } from "./buildMetadata";
import { performanceDiagnostics } from "./performanceDiagnostics";

export function BuildDiagnostics() {
  const isVisible = new URLSearchParams(window.location.search).has("diagnostics");
  const quality = useQuality();
  const [performanceSummary, setPerformanceSummary] = useState(() => performanceDiagnostics.read());
  const [resetConfirmed, setResetConfirmed] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    const interval = window.setInterval(
      () => setPerformanceSummary(performanceDiagnostics.read()),
      1_000,
    );
    return () => window.clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <details className="build-diagnostics">
      <summary>Build diagnostics</summary>
      <dl>
        <dt>Version</dt>
        <dd>{buildMetadata.version}</dd>
        <dt>Commit</dt>
        <dd>{buildMetadata.commit}</dd>
        <dt>Built</dt>
        <dd>{buildMetadata.builtAt}</dd>
        <dt>Quality</dt>
        <dd>{quality.level}</dd>
      </dl>
      <h2>Local performance</h2>
      {performanceSummary.scenes.length > 0 ? (
        <ul>
          {performanceSummary.scenes.map((scene) => (
            <li key={scene.scene}>
              {scene.scene}: {scene.averageFrameMs.toFixed(1)} ms average, {scene.lastDrawCalls}{" "}
              draw calls
              {scene.lastHeapBytes
                ? `, ${Math.round(scene.lastHeapBytes / 1_048_576)} MB heap`
                : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p>No frame samples yet.</p>
      )}
      {performanceSummary.roomLoads.length > 0 ? (
        <p>
          Last room load: {performanceSummary.roomLoads.at(-1)?.room},{" "}
          {performanceSummary.roomLoads.at(-1)?.durationMs.toFixed(0)} ms
        </p>
      ) : null}
      {resetConfirmed ? <p role="status">Performance metrics reset.</p> : null}
      <button
        type="button"
        onClick={() => {
          performanceDiagnostics.clear();
          setPerformanceSummary(performanceDiagnostics.read());
          setResetConfirmed(true);
        }}
      >
        Reset performance metrics
      </button>
    </details>
  );
}
