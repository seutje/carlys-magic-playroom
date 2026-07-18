import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

import { performanceDiagnostics } from "../diagnostics/performanceDiagnostics";

const SAMPLE_FRAMES = 30;

export function FrameDiagnostics({ scene }: { readonly scene: string }) {
  const accumulatedMs = useRef(0);
  const frames = useRef(0);

  useFrame(({ gl }, delta) => {
    accumulatedMs.current += delta * 1_000;
    frames.current += 1;
    if (frames.current < SAMPLE_FRAMES) return;

    const memory = (performance as Performance & { memory?: { usedJSHeapSize?: number } }).memory;
    performanceDiagnostics.recordFrame(
      scene,
      accumulatedMs.current / frames.current,
      gl.info.render.calls,
      memory?.usedJSHeapSize,
    );
    accumulatedMs.current = 0;
    frames.current = 0;
  });
  return null;
}
