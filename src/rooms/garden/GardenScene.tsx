import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import type { Group } from "three";

import { diagnostics } from "../../engine/diagnostics/diagnostics";
import { FrameDiagnostics } from "../../engine/rendering/FrameDiagnostics";
import { useQuality } from "../../engine/rendering/qualityContext";
import {
  createGardenModelInstance,
  disposeGardenModelInstance,
  disposeGardenModelSources,
  loadGardenModels,
  type GardenModelId,
  type GardenModelSources,
} from "./garden.model";
import { GROWTH_STAGES, type GardenState } from "./garden.types";

interface GardenSceneProps {
  readonly state: GardenState;
  readonly reducedEffects: boolean;
}

export function GardenScene({ state, reducedEffects }: GardenSceneProps) {
  const quality = useQuality();
  const stage = GROWTH_STAGES[state.growth];
  const models = useOwnedGardenModels();
  return (
    <div className={`garden-canvas ${state.timeOfDay}`} aria-label={`Garden with a ${stage}`}>
      <Canvas
        camera={{ position: [0, 3.5, 8], fov: 45 }}
        dpr={quality.dpr}
        shadows={quality.shadows}
        gl={{ antialias: quality.antialias, powerPreference: "high-performance" }}
        fallback={<p className="webgl-fallback">The garden picture is growing.</p>}
      >
        <FrameDiagnostics scene="garden" />
        <color attach="background" args={[state.timeOfDay === "day" ? "#9edbf0" : "#706da5"]} />
        <ambientLight intensity={state.timeOfDay === "day" ? 2 : 1.2} />
        <directionalLight position={[3, 7, 4]} intensity={state.light > 0 ? 2.8 : 1.4} />
        <mesh position={[0, -1.7, 0]}>
          <cylinderGeometry args={[3.4, 3.8, 0.7, 32]} />
          <meshStandardMaterial color="#79533c" roughness={1} />
        </mesh>
        <Plant growth={state.growth} source={models[stage]} />
        <group position={[-3.2, 2.2, -1]} scale={0.68}>
          <GardenCharacterModel source={models.sun} fallback={<SunFallback />} />
        </group>
        {quality.decorativeObjects ? (
          <group position={[2.6, 2.3, -0.5]}>
            <GardenCharacterModel source={models.cloud} fallback={<CloudFallback />} />
          </group>
        ) : null}
        {state.visitor !== "none" ? <Visitor kind={state.visitor} /> : null}
        {!reducedEffects && state.lastAction === "water" && state.phase === "evaluating" ? (
          <group position={[2.6, 1.2, 0]}>
            {[-0.5, 0, 0.5].slice(0, quality.particleCount).map((x) => (
              <mesh key={x} position={[x, -Math.abs(x), 0]}>
                <sphereGeometry args={[0.1, 10, 8]} />
                <meshStandardMaterial color="#57aee4" />
              </mesh>
            ))}
          </group>
        ) : null}
      </Canvas>
    </div>
  );
}

function Plant({
  growth,
  source,
}: {
  readonly growth: GardenState["growth"];
  readonly source: Group | undefined;
}) {
  const stage = GROWTH_STAGES[growth];
  const scale = stage === "flower" ? 1.15 : stage === "bud" ? 1.05 : 1;
  return (
    <group position={[0, -1.3, 0]} scale={scale}>
      <GardenCharacterModel source={source} fallback={<PlantFallback growth={growth} />} />
    </group>
  );
}

function GardenCharacterModel({
  source,
  fallback,
}: {
  readonly source: Group | undefined;
  readonly fallback: React.ReactNode;
}) {
  const instance = useMemo(
    () => (source ? createGardenModelInstance(source) : undefined),
    [source],
  );
  useEffect(
    () => () => {
      if (instance) disposeGardenModelInstance(instance);
    },
    [instance],
  );
  return instance ? <primitive object={instance} /> : fallback;
}

function PlantFallback({ growth }: { readonly growth: GardenState["growth"] }) {
  const height = [0.15, 1, 1.8, 2.5][growth] ?? 0.15;
  return (
    <>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.1, 0.16, height, 12]} />
        <meshStandardMaterial color="#4d934d" />
      </mesh>
      {growth >= 1 ? (
        <mesh position={[-0.35, height * 0.55, 0]} rotation={[0, 0, -0.8]}>
          <sphereGeometry args={[0.35, 14, 10]} />
          <meshStandardMaterial color="#66b85c" />
        </mesh>
      ) : null}
      {growth >= 2 ? (
        <mesh position={[0, height + 0.1, 0]}>
          <sphereGeometry args={[growth === 3 ? 0.75 : 0.4, 20, 14]} />
          <meshStandardMaterial color={growth === 3 ? "#ed79a4" : "#d96f91"} />
        </mesh>
      ) : null}
      {growth === 3 ? (
        <mesh position={[0, height + 0.15, 0.65]}>
          <sphereGeometry args={[0.25, 16, 12]} />
          <meshStandardMaterial color="#ffd65b" />
        </mesh>
      ) : null}
    </>
  );
}

function SunFallback() {
  return (
    <mesh scale={1 / 0.68}>
      <sphereGeometry args={[0.8, 20, 14]} />
      <meshStandardMaterial color="#ffe477" emissive="#a86d00" emissiveIntensity={0.35} />
    </mesh>
  );
}

function CloudFallback() {
  return (
    <>
      {[-0.6, 0, 0.6].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <sphereGeometry args={[0.65, 16, 12]} />
          <meshStandardMaterial color="#f4f7fa" />
        </mesh>
      ))}
    </>
  );
}

function useOwnedGardenModels(): GardenModelSources {
  const [models, setModels] = useState<GardenModelSources>({});

  useEffect(() => {
    let disposed = false;
    let ownedModels: GardenModelSources = {};
    void loadGardenModels().then(({ models: loadedModels, failedIds }) => {
      if (disposed) {
        disposeGardenModelSources(loadedModels);
        return;
      }
      ownedModels = loadedModels;
      failedIds.forEach((id: GardenModelId) => {
        diagnostics.record({ category: "asset", code: `garden-model-load-failed:${id}` });
      });
      setModels(loadedModels);
    });

    return () => {
      disposed = true;
      disposeGardenModelSources(ownedModels);
    };
  }, []);

  return models;
}

function Visitor({ kind }: { readonly kind: Exclude<GardenState["visitor"], "none"> }) {
  return (
    <group position={[2, 0.8, 1]}>
      <mesh>
        <sphereGeometry args={[0.25, 14, 10]} />
        <meshStandardMaterial color={kind === "butterfly" ? "#8d65cf" : "#dd5151"} />
      </mesh>
      {[-0.35, 0.35].map((x) => (
        <mesh key={x} position={[x, 0.1, 0]} scale={[1, 1.3, 0.3]}>
          <sphereGeometry args={[0.28, 14, 10]} />
          <meshStandardMaterial color={kind === "butterfly" ? "#f5a9d0" : "#47354d"} />
        </mesh>
      ))}
    </group>
  );
}
