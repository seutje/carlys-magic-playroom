import { buildMetadata } from "./buildMetadata";

export function BuildDiagnostics() {
  const isVisible = new URLSearchParams(window.location.search).has("diagnostics");
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
      </dl>
    </details>
  );
}
