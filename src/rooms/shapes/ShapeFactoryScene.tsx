import { Canvas } from "@react-three/fiber";

import { FrameDiagnostics } from "../../engine/rendering/FrameDiagnostics";
import { useQuality } from "../../engine/rendering/qualityContext";
import type { ShapeFactoryState } from "./shapes.types";

interface ShapeFactorySceneProps {
  readonly state: ShapeFactoryState;
  readonly reducedMotion: boolean;
}

export function ShapeFactoryScene({ state, reducedMotion }: ShapeFactorySceneProps) {
  const quality = useQuality();
  const active = !state.conveyorPaused && !reducedMotion && state.phase !== "complete";
  return (
    <div className="shape-factory-canvas" aria-label="A friendly shape factory">
      <Canvas
        camera={{ position: [0, 2.8, 9], fov: 44 }}
        dpr={quality.dpr}
        shadows={quality.shadows}
        gl={{ antialias: quality.antialias, powerPreference: "high-performance" }}
        fallback={<p className="webgl-fallback">The friendly shape machine is ready.</p>}
      >
        <FrameDiagnostics scene="shapes" />
        <color attach="background" args={["#ffd59a"]} />
        <ambientLight intensity={2.2} />
        <directionalLight position={[4, 7, 5]} intensity={2.3} />
        <mesh position={[0, -2.2, -1]}>
          <boxGeometry args={[10, 0.45, 5]} />
          <meshStandardMaterial color="#8bc4b1" />
        </mesh>
        <group position={[1.6, 0, 0]}>
          <mesh>
            <boxGeometry args={[3.1, 4.3, 2.2]} />
            <meshStandardMaterial color="#7b65b5" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.4, 1.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.05, 1.05, 0.3, 32]} />
            <meshStandardMaterial color={state.phase === "processing" ? "#ffdc62" : "#d8d1f2"} />
          </mesh>
          <mesh position={[-0.45, 1.45, 1.16]}>
            <sphereGeometry args={[0.13, 12, 8]} />
            <meshStandardMaterial color="#25223e" />
          </mesh>
          <mesh position={[0.45, 1.45, 1.16]}>
            <sphereGeometry args={[0.13, 12, 8]} />
            <meshStandardMaterial color="#25223e" />
          </mesh>
          <mesh position={[1.9, -1.2, 0]} rotation={[0, 0, -0.32]}>
            <boxGeometry args={[1.5, 0.75, 1.4]} />
            <meshStandardMaterial color="#ed895a" />
          </mesh>
        </group>
        <group position={[-2.8, -1.2, 0]}>
          <mesh>
            <boxGeometry args={[4.3, 0.42, 1.8]} />
            <meshStandardMaterial color="#4d536e" />
          </mesh>
          {[-1.5, -0.5, 0.5, 1.5].map((x, index) => (
            <mesh key={x} position={[x, 0.23, 0]} rotation={[0, 0, active ? index * 0.35 : 0]}>
              <boxGeometry args={[0.12, 0.09, 1.65]} />
              <meshStandardMaterial color="#9aa4bd" />
            </mesh>
          ))}
        </group>
        {state.outputItemId ? (
          <mesh position={[3.7, -1.1, 0.2]}>
            <sphereGeometry args={[0.58, 20, 14]} />
            <meshStandardMaterial color="#68b8ec" emissive="#4c83a8" emissiveIntensity={0.25} />
          </mesh>
        ) : null}
      </Canvas>
    </div>
  );
}
