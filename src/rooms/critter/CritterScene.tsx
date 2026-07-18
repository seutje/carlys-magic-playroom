import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Group } from "three";

import { diagnostics } from "../../engine/diagnostics/diagnostics";
import { FrameDiagnostics } from "../../engine/rendering/FrameDiagnostics";
import { useQuality } from "../../engine/rendering/qualityContext";
import {
  createCritterModelInstance,
  disposeCritterModelInstance,
  disposeCritterModelSources,
  loadCritterModels,
  type CritterModelId,
  type CritterModelSources,
} from "./critter.model";
import type { CritterAssemblyState } from "./critter.types";

interface CritterSceneProps {
  readonly creature: CritterAssemblyState;
  readonly reducedMotion: boolean;
}

const BODY_COLORS = { lavender: "#9b7fd1", mint: "#66bd9a", peach: "#ee9d78" } as const;

export function CritterScene({ creature, reducedMotion }: CritterSceneProps) {
  const quality = useQuality();
  const models = useOwnedCritterModels();
  return (
    <div className="critter-canvas" aria-label="Build-a-Critter preview">
      <Canvas
        camera={{ position: [0, 1.2, 7], fov: 42 }}
        dpr={quality.dpr}
        shadows={quality.shadows}
        gl={{ antialias: quality.antialias, powerPreference: "high-performance" }}
        fallback={<p className="webgl-fallback">The critter is smiling in its picture.</p>}
      >
        <FrameDiagnostics scene="critter" />
        <color attach="background" args={["#ddcff5"]} />
        <ambientLight intensity={2} />
        <directionalLight position={[3, 5, 5]} intensity={2.2} />
        <mesh position={[0, -2.1, 0]}>
          <cylinderGeometry args={[2.8, 3.2, 0.35, 32]} />
          <meshStandardMaterial color="#f4d06f" />
        </mesh>
        <Critter creature={creature} reducedMotion={reducedMotion} models={models} />
        {quality.decorativeObjects ? (
          <mesh position={[3.4, 0.4, -1.2]}>
            <boxGeometry args={[1.8, 4.5, 0.2]} />
            <meshStandardMaterial color="#b9ddec" metalness={0.25} roughness={0.3} />
          </mesh>
        ) : null}
      </Canvas>
    </div>
  );
}

function Critter({
  creature,
  reducedMotion,
  models,
}: CritterSceneProps & { readonly models: CritterModelSources }) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!group.current || !creature.reaction || reducedMotion) return;
    const wave = Math.sin(clock.elapsedTime * 10);
    if (creature.reaction === "bounce") group.current.position.y = Math.abs(wave) * 0.35;
    if (creature.reaction === "wave") group.current.rotation.z = wave * 0.12;
    if (creature.reaction === "sparkle") group.current.scale.setScalar(1 + Math.abs(wave) * 0.08);
  });

  return (
    <group ref={group} position={[-0.5, -0.05, 0]} scale={0.88}>
      <CritterComponentModel
        source={models[`body-${creature.bodyId}`]}
        bodyColor={BODY_COLORS[creature.color]}
        fallback={<BodyFallback bodyId={creature.bodyId} color={BODY_COLORS[creature.color]} />}
      />
      <Pattern pattern={creature.pattern} />
      {creature.parts.eyes ? (
        <group position={[0, 0.45, 1.25]}>
          <CritterComponentModel
            source={models[creature.parts.eyes]}
            fallback={<EyesFallback stars={creature.parts.eyes === "eyes-star"} />}
          />
        </group>
      ) : null}
      {creature.parts.mouth ? (
        <group position={[0, -0.25, 1.31]}>
          <CritterComponentModel
            source={models[creature.parts.mouth]}
            fallback={<MouthFallback round={creature.parts.mouth === "mouth-o"} />}
          />
        </group>
      ) : null}
      {creature.parts.legs ? (
        <group position={[0, -1.2, 0]}>
          <CritterComponentModel
            source={models[creature.parts.legs]}
            fallback={<LegsFallback partId={creature.parts.legs} />}
          />
        </group>
      ) : null}
      {creature.reaction === "sparkle" || (reducedMotion && creature.reaction) ? (
        <group>
          {[-2, 2].map((x) => (
            <mesh key={x} position={[x, 1.8, 0]} rotation={[0, 0, Math.PI / 4]}>
              <octahedronGeometry args={[0.3]} />
              <meshStandardMaterial color="#fff3a6" emissive="#8a6400" emissiveIntensity={0.4} />
            </mesh>
          ))}
        </group>
      ) : null}
    </group>
  );
}

function CritterComponentModel({
  source,
  bodyColor,
  fallback,
}: {
  readonly source: Group | undefined;
  readonly bodyColor?: string;
  readonly fallback: React.ReactNode;
}) {
  const instance = useMemo(
    () => (source ? createCritterModelInstance(source, bodyColor) : undefined),
    [bodyColor, source],
  );
  useEffect(
    () => () => {
      if (instance) disposeCritterModelInstance(instance);
    },
    [instance],
  );
  return instance ? <primitive object={instance} /> : fallback;
}

function BodyFallback({
  bodyId,
  color,
}: {
  readonly bodyId: CritterAssemblyState["bodyId"];
  readonly color: string;
}) {
  const bodyScale: [number, number, number] = bodyId === "tall" ? [1.15, 1.5, 1] : [1.4, 1.2, 1];
  return (
    <mesh scale={bodyScale}>
      <sphereGeometry args={[1.3, 28, 20]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}

function EyesFallback({ stars }: { readonly stars: boolean }) {
  return (
    <group>
      {[-0.45, 0.45].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          {stars ? <octahedronGeometry args={[0.24]} /> : <sphereGeometry args={[0.22, 16, 12]} />}
          <meshStandardMaterial color="#403451" />
        </mesh>
      ))}
    </group>
  );
}

function MouthFallback({ round }: { readonly round: boolean }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry
        args={[round ? 0.22 : 0.35, 0.07, 10, round ? 24 : 12, round ? Math.PI * 2 : Math.PI]}
      />
      <meshStandardMaterial color="#6d3650" />
    </mesh>
  );
}

function LegsFallback({ partId }: { readonly partId: string }) {
  const height = partId === "legs-tall" ? 1.25 : partId === "legs-stompy" ? 0.55 : 0.8;
  return (
    <group>
      {[-0.65, 0.65].map((x) => (
        <mesh key={x} position={[x, -height / 2, 0]}>
          <capsuleGeometry args={[partId === "legs-stompy" ? 0.3 : 0.2, height, 6, 12]} />
          <meshStandardMaterial color="#59496b" />
        </mesh>
      ))}
    </group>
  );
}

function useOwnedCritterModels(): CritterModelSources {
  const [models, setModels] = useState<CritterModelSources>({});

  useEffect(() => {
    let disposed = false;
    let ownedModels: CritterModelSources = {};
    void loadCritterModels().then(({ models: loadedModels, failedIds }) => {
      if (disposed) {
        disposeCritterModelSources(loadedModels);
        return;
      }
      ownedModels = loadedModels;
      failedIds.forEach((id: CritterModelId) => {
        diagnostics.record({ category: "asset", code: `critter-model-load-failed:${id}` });
      });
      setModels(loadedModels);
    });

    return () => {
      disposed = true;
      disposeCritterModelSources(ownedModels);
    };
  }, []);

  return models;
}

function Pattern({ pattern }: Pick<CritterAssemblyState, "pattern">) {
  if (pattern === "plain") return null;
  const positions: readonly (readonly [number, number])[] =
    pattern === "spots"
      ? [
          [-0.7, 0.2],
          [0.65, -0.5],
          [0.4, 0.8],
        ]
      : [
          [-0.8, 0.5],
          [0, 0],
          [0.8, -0.5],
        ];
  return (
    <group position={[0, 0, 1.25]}>
      {positions.map(([x, y], index) => (
        <mesh
          key={index}
          position={[x, y, 0]}
          scale={pattern === "stripes" ? [1.6, 0.3, 0.3] : 0.2}
        >
          <sphereGeometry args={[0.35, 12, 8]} />
          <meshStandardMaterial color="#fff3dc" />
        </mesh>
      ))}
    </group>
  );
}
