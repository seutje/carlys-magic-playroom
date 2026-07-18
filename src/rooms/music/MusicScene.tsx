import { Canvas } from "@react-three/fiber";

import { FrameDiagnostics } from "../../engine/rendering/FrameDiagnostics";
import { useQuality } from "../../engine/rendering/qualityContext";
import type { InstrumentId, MusicState } from "./music.types";

export function MusicScene({
  state,
  reducedEffects,
}: {
  readonly state: MusicState;
  readonly reducedEffects: boolean;
}) {
  const quality = useQuality();
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
        />
        <Instrument
          instrument="bell"
          position={[0, -0.6, 0]}
          active={Boolean(state.selectedChoiceId?.startsWith("bell"))}
        />
        <Instrument
          instrument="xylophone"
          position={[3, -0.8, 0]}
          active={Boolean(state.selectedChoiceId?.startsWith("xylophone"))}
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
}: {
  readonly instrument: InstrumentId;
  readonly position: [number, number, number];
  readonly active: boolean;
}) {
  if (instrument === "drum")
    return (
      <group position={position} scale={active ? 1.08 : 1}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1, 1, 1.15, 24]} />
          <meshStandardMaterial color="#e56c70" />
        </mesh>
        <mesh position={[-0.35, 1, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.06, 0.06, 1.7, 8]} />
          <meshStandardMaterial color="#f5d5a0" />
        </mesh>
      </group>
    );
  if (instrument === "bell")
    return (
      <group position={position} scale={active ? 1.08 : 1}>
        <mesh>
          <coneGeometry args={[1, 1.7, 24, 1, true]} />
          <meshStandardMaterial color="#f4ca4b" metalness={0.35} />
        </mesh>
        <mesh position={[0, -0.9, 0]}>
          <sphereGeometry args={[0.22, 12, 8]} />
          <meshStandardMaterial color="#9d6c28" />
        </mesh>
      </group>
    );
  return (
    <group position={position} scale={active ? 1.08 : 1} rotation={[0, 0, -0.12]}>
      {["#ef6d72", "#f2a44d", "#efd65d", "#72c57a", "#62b8df"].map((color, index) => (
        <mesh key={color} position={[index * 0.38 - 0.75, 0, 0]}>
          <boxGeometry args={[0.32, 1.8 - index * 0.16, 0.38]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}
