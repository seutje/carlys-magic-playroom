import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import type { Group } from "three";

import { diagnostics } from "../../engine/diagnostics/diagnostics";
import { FrameDiagnostics } from "../../engine/rendering/FrameDiagnostics";
import { useQuality } from "../../engine/rendering/qualityContext";
import {
  createMusicModelInstance,
  disposeMusicModelInstance,
  disposeMusicModelSources,
  loadMusicModels,
  type MusicModelSources,
} from "./music.model";
import type { InstrumentId, MusicState } from "./music.types";

export function MusicScene({
  state,
  reducedEffects,
}: {
  readonly state: MusicState;
  readonly reducedEffects: boolean;
}) {
  const quality = useQuality();
  const models = useOwnedMusicModels();
  return (
    <div className="music-canvas" aria-label="A stage with a drum, bell, and xylophone">
      <Canvas
        camera={{ position: [0, 2.8, 9], fov: 45 }}
        dpr={quality.dpr}
        shadows={quality.shadows}
        gl={{ antialias: quality.antialias, powerPreference: "high-performance" }}
        fallback={<p className="webgl-fallback">The musical picture is ready.</p>}
      >
        <FrameDiagnostics scene="music" />
        <color attach="background" args={["#384f8b"]} />
        <ambientLight intensity={2} />
        <directionalLight position={[2, 7, 4]} intensity={2.5} />
        <mesh position={[0, -2, -1]}>
          <cylinderGeometry args={[6, 6.8, 0.8, 32]} />
          <meshStandardMaterial color="#80509a" />
        </mesh>
        <Instrument
          instrument="drum"
          position={[-3, -0.8, 0]}
          active={Boolean(state.selectedChoiceId?.startsWith("drum"))}
          source={models.drum}
        />
        <Instrument
          instrument="bell"
          position={[0, -0.6, 0]}
          active={Boolean(state.selectedChoiceId?.startsWith("bell"))}
          source={models.bell}
        />
        <Instrument
          instrument="xylophone"
          position={[3, -0.8, 0]}
          active={Boolean(state.selectedChoiceId?.startsWith("xylophone"))}
          source={models.xylophone}
        />
        {!reducedEffects &&
          [-4, -2, 0, 2, 4]
            .slice(0, quality.particleCount)
            .map((x, index) => (
              <pointLight
                key={x}
                position={[x, 3, 1]}
                color={(["#ff87a6", "#ffd45e", "#70d2dd"] as const)[index % 3] ?? "#fff"}
                intensity={2}
                distance={5}
              />
            ))}
      </Canvas>
    </div>
  );
}

function Instrument({
  instrument,
  position,
  active,
  source,
}: {
  readonly instrument: InstrumentId;
  readonly position: [number, number, number];
  readonly active: boolean;
  readonly source: Group | undefined;
}) {
  const baseScale = instrument === "xylophone" ? 0.9 : instrument === "bell" ? 0.94 : 1;
  return (
    <group
      position={position}
      scale={baseScale * (active ? 1.08 : 1)}
      rotation={instrument === "xylophone" ? [0, 0, -0.12] : [0, 0, 0]}
    >
      {source ? (
        <MusicInstrumentModel source={source} />
      ) : (
        <InstrumentFallback instrument={instrument} />
      )}
    </group>
  );
}

function MusicInstrumentModel({ source }: { readonly source: Group }) {
  const instance = useMemo(() => createMusicModelInstance(source), [source]);
  useEffect(() => () => disposeMusicModelInstance(instance), [instance]);
  return <primitive object={instance} />;
}

function InstrumentFallback({ instrument }: { readonly instrument: InstrumentId }) {
  if (instrument === "drum")
    return (
      <>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1, 1, 1.15, 24]} />
          <meshStandardMaterial color="#e56c70" />
        </mesh>
        <mesh position={[-0.35, 1, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.06, 0.06, 1.7, 8]} />
          <meshStandardMaterial color="#f5d5a0" />
        </mesh>
      </>
    );
  if (instrument === "bell")
    return (
      <>
        <mesh>
          <coneGeometry args={[1, 1.7, 24, 1, true]} />
          <meshStandardMaterial color="#f4ca4b" metalness={0.35} />
        </mesh>
        <mesh position={[0, -0.9, 0]}>
          <sphereGeometry args={[0.22, 12, 8]} />
          <meshStandardMaterial color="#9d6c28" />
        </mesh>
      </>
    );
  return (
    <>
      {["#ef6d72", "#f2a44d", "#efd65d", "#72c57a", "#62b8df"].map((color, index) => (
        <mesh key={color} position={[index * 0.38 - 0.75, 0, 0]}>
          <boxGeometry args={[0.32, 1.8 - index * 0.16, 0.38]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </>
  );
}

function useOwnedMusicModels(): MusicModelSources {
  const [models, setModels] = useState<MusicModelSources>({});

  useEffect(() => {
    let disposed = false;
    let ownedModels: MusicModelSources = {};
    void loadMusicModels().then(({ models: loadedModels, failedIds }) => {
      if (disposed) {
        disposeMusicModelSources(loadedModels);
        return;
      }
      ownedModels = loadedModels;
      failedIds.forEach((id) => {
        diagnostics.record({ category: "asset", code: `music-model-load-failed:${id}` });
      });
      setModels(loadedModels);
    });

    return () => {
      disposed = true;
      disposeMusicModelSources(ownedModels);
    };
  }, []);

  return models;
}
