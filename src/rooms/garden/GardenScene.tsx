import { Canvas } from "@react-three/fiber";

import { GROWTH_STAGES, type GardenState } from "./garden.types";

interface GardenSceneProps {
  readonly state: GardenState;
  readonly reducedEffects: boolean;
}

export function GardenScene({ state, reducedEffects }: GardenSceneProps) {
  const stage = GROWTH_STAGES[state.growth];
  return (
    <div className={`garden-canvas ${state.timeOfDay}`} aria-label={`Garden with a ${stage}`}>
      <Canvas
        camera={{ position: [0, 3.5, 8], fov: 45 }}
        dpr={[1, 1.5]}
        fallback={<p className="webgl-fallback">The garden picture is growing.</p>}
      >
        <color attach="background" args={[state.timeOfDay === "day" ? "#9edbf0" : "#706da5"]} />
        <ambientLight intensity={state.timeOfDay === "day" ? 2 : 1.2} />
        <directionalLight position={[3, 7, 4]} intensity={state.light > 0 ? 2.8 : 1.4} />
        <mesh position={[0, -1.7, 0]}>
          <cylinderGeometry args={[3.4, 3.8, 0.7, 32]} />
          <meshStandardMaterial color="#79533c" roughness={1} />
        </mesh>
        <Plant growth={state.growth} />
        <mesh position={[-3.2, 2.2, -1]}>
          <sphereGeometry args={[0.8, 20, 14]} />
          <meshStandardMaterial color="#ffe477" emissive="#a86d00" emissiveIntensity={0.35} />
        </mesh>
        <group position={[2.6, 2.3, -0.5]}>
          {[-0.6, 0, 0.6].map((x) => (
            <mesh key={x} position={[x, 0, 0]}>
              <sphereGeometry args={[0.65, 16, 12]} />
              <meshStandardMaterial color="#f4f7fa" />
            </mesh>
          ))}
        </group>
        {state.visitor !== "none" ? <Visitor kind={state.visitor} /> : null}
        {!reducedEffects && state.lastAction === "water" && state.phase === "evaluating" ? (
          <group position={[2.6, 1.2, 0]}>
            {[-0.5, 0, 0.5].map((x) => (
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

function Plant({ growth }: { readonly growth: GardenState["growth"] }) {
  const height = [0.15, 1, 1.8, 2.5][growth] ?? 0.15;
  return (
    <group position={[0, -1.3, 0]}>
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
    </group>
  );
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
