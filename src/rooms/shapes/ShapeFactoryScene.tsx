import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef } from "react";
import { Object3D, type Group, type InstancedMesh, type Mesh } from "three";

import { FrameDiagnostics } from "../../engine/rendering/FrameDiagnostics";
import { useQuality } from "../../engine/rendering/qualityContext";
import { activeStep } from "./shapes.machine";
import {
  calculateGearAngles,
  FACTORY_GEARS,
  factoryDriveSpeed,
  gearOuterRadius,
  gearPitchRadius,
  shapeProductPresentation,
  type FactoryGearSpec,
  type ShapeOutputPhase,
} from "./shapeFactory.model";
import type { ShapeFactoryState, ShapeKind, ShapeRule } from "./shapes.types";

interface ShapeFactorySceneProps {
  readonly state: ShapeFactoryState;
  readonly reducedMotion: boolean;
}

export function ShapeFactoryScene({ state, reducedMotion }: ShapeFactorySceneProps) {
  const quality = useQuality();
  const step = activeStep(state);
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
        <color attach="background" args={["#ffd89e"]} />
        <ambientLight intensity={1.7} />
        <hemisphereLight args={["#fff4d6", "#587d70", 1.25]} />
        <directionalLight castShadow={quality.shadows} position={[-3, 7, 6]} intensity={2.4} />
        <FactoryFloor />
        <FactoryMachine state={state} reducedMotion={reducedMotion} />
        <FactoryConveyor state={state} reducedMotion={reducedMotion} />
        {state.outputItemId && isOutputPhase(state.phase) ? (
          <ShapeProduct
            rule={step.puzzle.target}
            phase={state.phase}
            reducedMotion={reducedMotion}
            effectCount={quality.particleCount}
          />
        ) : null}
      </Canvas>
    </div>
  );
}

function FactoryFloor() {
  return (
    <group>
      <mesh receiveShadow position={[0, -2.22, -0.8]}>
        <boxGeometry args={[11, 0.42, 5.5]} />
        <meshStandardMaterial color="#79b7a5" roughness={0.88} />
      </mesh>
      {[-4.5, -3, -1.5, 0, 1.5, 3, 4.5].map((x) => (
        <mesh key={x} position={[x, -1.995, 0.8]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.08, 0.015, 3.8]} />
          <meshStandardMaterial color="#a9dac9" />
        </mesh>
      ))}
    </group>
  );
}

function FactoryMachine({ state, reducedMotion }: ShapeFactorySceneProps) {
  return (
    <group position={[1.55, -0.02, -0.05]}>
      <mesh castShadow receiveShadow position={[0, -0.08, 0]}>
        <boxGeometry args={[4.25, 4.18, 1.75]} />
        <meshStandardMaterial color="#66509b" roughness={0.55} metalness={0.08} />
      </mesh>
      <mesh position={[0, 2.08, 0]}>
        <cylinderGeometry args={[2.125, 2.125, 1.75, 6, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#8069b1" roughness={0.5} />
      </mesh>

      <mesh position={[-0.63, 0.48, 0.91]}>
        <boxGeometry args={[2.9, 2.75, 0.12]} />
        <meshStandardMaterial color="#41385f" roughness={0.6} />
      </mesh>
      <mesh position={[-0.63, 0.48, 0.99]}>
        <boxGeometry args={[3.08, 2.93, 0.06]} />
        <meshStandardMaterial color="#d7c7ec" metalness={0.35} roughness={0.35} />
      </mesh>
      <mesh position={[-0.63, 0.48, 1.04]}>
        <boxGeometry args={[2.86, 2.71, 0.07]} />
        <meshStandardMaterial color="#302946" roughness={0.75} />
      </mesh>
      <GearTrain state={state} reducedMotion={reducedMotion} />

      <mesh position={[1.28, 1.55, 0.94]}>
        <cylinderGeometry args={[0.37, 0.37, 0.13, 32]} />
        <meshStandardMaterial color="#f7e5a4" metalness={0.2} roughness={0.35} />
      </mesh>
      <mesh position={[1.28, 1.55, 1.03]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.045, 0.34, 0.045]} />
        <meshStandardMaterial color="#e86071" />
      </mesh>
      <mesh position={[1.28, 0.97, 0.96]}>
        <boxGeometry args={[0.92, 0.18, 0.14]} />
        <meshStandardMaterial color="#f0cf5e" />
      </mesh>

      {(
        [
          [-1.92, -1.83],
          [1.92, -1.83],
        ] as const
      ).map(([x, y]) => (
        <group key={x} position={[x, y, 0]}>
          <mesh>
            <boxGeometry args={[0.35, 0.72, 1.45]} />
            <meshStandardMaterial color="#42385e" />
          </mesh>
          <mesh position={[0, -0.43, 0.08]}>
            <cylinderGeometry args={[0.28, 0.34, 0.18, 16]} />
            <meshStandardMaterial color="#f0ad4e" roughness={0.7} />
          </mesh>
        </group>
      ))}

      <group position={[2.42, -1.23, 0.05]} rotation={[0, 0, -0.22]}>
        <mesh castShadow>
          <boxGeometry args={[1.35, 0.78, 1.35]} />
          <meshStandardMaterial color="#e77952" roughness={0.48} />
        </mesh>
        <mesh position={[0.68, 0.06, 0]}>
          <boxGeometry args={[0.12, 0.56, 1.1]} />
          <meshStandardMaterial color="#ffbe68" />
        </mesh>
      </group>

      <group position={[-1.45, 2.48, -0.15]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.38, 1.15, 18]} />
          <meshStandardMaterial color="#4f7891" metalness={0.25} roughness={0.42} />
        </mesh>
        <mesh position={[0, 0.63, 0]}>
          <cylinderGeometry args={[0.46, 0.31, 0.22, 18]} />
          <meshStandardMaterial color="#e66e70" roughness={0.45} />
        </mesh>
      </group>
    </group>
  );
}

function GearTrain({ state, reducedMotion }: ShapeFactorySceneProps) {
  const gearRefs = useRef<(Group | null)[]>([]);
  const driveAngle = useRef(0);

  useFrame((_, delta) => {
    driveAngle.current += Math.min(delta, 0.05) * factoryDriveSpeed(state, reducedMotion);
    const angles = calculateGearAngles(driveAngle.current);
    FACTORY_GEARS.forEach((gear, index) => {
      const group = gearRefs.current[index];
      if (group) group.rotation.z = angles[gear.id];
    });
  });

  return (
    <group position={[-0.02, 0.16, 0]}>
      {FACTORY_GEARS.map((gear, index) => (
        <group
          key={gear.id}
          ref={(node) => {
            gearRefs.current[index] = node;
          }}
          position={gear.position}
        >
          <Gear spec={gear} />
        </group>
      ))}
    </group>
  );
}

function Gear({ spec }: { readonly spec: FactoryGearSpec }) {
  const pitchRadius = gearPitchRadius(spec.teeth);
  const outerRadius = gearOuterRadius(spec.teeth);
  const toothLength = outerRadius - pitchRadius + 0.07;
  const teethRef = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const teeth = teethRef.current;
    if (!teeth) return;
    const transform = new Object3D();
    for (let tooth = 0; tooth < spec.teeth; tooth += 1) {
      const angle = (tooth / spec.teeth) * Math.PI * 2;
      transform.position.set(
        Math.cos(angle) * (pitchRadius + toothLength * 0.3),
        Math.sin(angle) * (pitchRadius + toothLength * 0.3),
        0,
      );
      transform.rotation.set(0, 0, angle);
      transform.updateMatrix();
      teeth.setMatrixAt(tooth, transform.matrix);
    }
    teeth.instanceMatrix.needsUpdate = true;
  }, [pitchRadius, spec.teeth, toothLength]);

  return (
    <group>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[pitchRadius, pitchRadius, 0.2, Math.max(24, spec.teeth * 2)]} />
        <meshStandardMaterial color={spec.color} metalness={0.24} roughness={0.36} />
      </mesh>
      <instancedMesh castShadow ref={teethRef} args={[undefined, undefined, spec.teeth]}>
        <boxGeometry args={[toothLength, (Math.PI * pitchRadius) / spec.teeth, 0.22]} />
        <meshStandardMaterial color={spec.color} metalness={0.24} roughness={0.36} />
      </instancedMesh>
      <mesh position={[0, 0, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[pitchRadius * 0.28, pitchRadius * 0.28, 0.18, 20]} />
        <meshStandardMaterial color="#fff0bc" metalness={0.45} roughness={0.28} />
      </mesh>
      {[0, Math.PI / 2].map((angle) => (
        <mesh key={angle} position={[0, 0, 0.125]} rotation={[0, 0, angle]}>
          <boxGeometry args={[pitchRadius * 1.2, pitchRadius * 0.13, 0.09]} />
          <meshStandardMaterial color="#fff0bc" metalness={0.35} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function FactoryConveyor({ state, reducedMotion }: ShapeFactorySceneProps) {
  const rollerRefs = useRef<(Group | null)[]>([]);
  const rollerAngle = useRef(0);
  useFrame((_, delta) => {
    rollerAngle.current -= Math.min(delta, 0.05) * factoryDriveSpeed(state, reducedMotion) * 1.35;
    rollerRefs.current.forEach((roller) => {
      if (roller) roller.rotation.z = rollerAngle.current;
    });
  });
  return (
    <group position={[-2.55, -1.18, 0.12]}>
      <mesh castShadow>
        <boxGeometry args={[4.7, 0.52, 1.85]} />
        <meshStandardMaterial color="#39465d" metalness={0.18} roughness={0.52} />
      </mesh>
      <mesh position={[0, 0.31, 0]}>
        <boxGeometry args={[4.5, 0.12, 1.66]} />
        <meshStandardMaterial color="#91a7b8" roughness={0.72} />
      </mesh>
      {[-1.8, -0.9, 0, 0.9, 1.8].map((x, index) => (
        <group
          key={x}
          ref={(node) => {
            rollerRefs.current[index] = node;
          }}
          position={[x, 0.39, 0]}
        >
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 1.68, 18]} />
            <meshStandardMaterial color="#d8e2e7" metalness={0.45} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0, 0.86]}>
            <boxGeometry args={[0.08, 0.24, 0.04]} />
            <meshStandardMaterial color="#f0ad4e" />
          </mesh>
        </group>
      ))}
      {[-1.9, 1.9].map((x) => (
        <group key={x} position={[x, -0.48, 0]}>
          <mesh>
            <boxGeometry args={[0.24, 0.7, 1.48]} />
            <meshStandardMaterial color="#4b5369" />
          </mesh>
          <mesh position={[0, -0.42, 0]}>
            <cylinderGeometry args={[0.24, 0.3, 0.16, 14]} />
            <meshStandardMaterial color="#ef9d47" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ShapeProduct({
  rule,
  phase,
  reducedMotion,
  effectCount,
}: {
  readonly rule: ShapeRule;
  readonly phase: ShapeOutputPhase;
  readonly reducedMotion: boolean;
  readonly effectCount: number;
}) {
  const product = useRef<Group>(null);
  const halo = useRef<Mesh>(null);
  const elapsed = useRef(0);

  useEffect(() => {
    elapsed.current = 0;
  }, [phase]);

  useFrame((_, delta) => {
    elapsed.current += Math.min(delta, 0.05);
    const pose = shapeProductPresentation(phase, elapsed.current, rule.size, reducedMotion);
    product.current?.position.set(...pose.position);
    product.current?.rotation.set(...pose.rotation);
    product.current?.scale.setScalar(pose.scale);
    if (halo.current && !reducedMotion && phase === "output") {
      halo.current.rotation.z = elapsed.current * 0.8;
    }
  });

  const initialPose = shapeProductPresentation(phase, 0, rule.size, reducedMotion);
  const sparkleCount = reducedMotion ? 0 : effectCount;
  return (
    <group
      ref={product}
      position={initialPose.position}
      rotation={initialPose.rotation}
      scale={initialPose.scale}
    >
      <mesh ref={halo} position={[0, 0, -0.32]}>
        <ringGeometry args={[1.02, 1.25, 32]} />
        <meshBasicMaterial color="#fff1a8" transparent opacity={0.82} depthWrite={false} />
      </mesh>
      <mesh castShadow>
        <ProductGeometry kind={rule.kind} />
        <meshStandardMaterial
          color={rule.color}
          emissive={rule.color}
          emissiveIntensity={0.24}
          metalness={0.08}
          roughness={0.28}
        />
      </mesh>
      {Array.from({ length: sparkleCount }, (_, index) => {
        const angle = (index / Math.max(1, sparkleCount)) * Math.PI * 2 + 0.35;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * 1.55, Math.sin(angle) * 1.4, -0.05]}
            scale={0.12 + (index % 2) * 0.04}
          >
            <octahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color={index % 2 === 0 ? "#fff7c7" : "#ffffff"} />
          </mesh>
        );
      })}
    </group>
  );
}

function isOutputPhase(phase: ShapeFactoryState["phase"]): phase is ShapeOutputPhase {
  return phase === "output" || phase === "celebrating" || phase === "complete";
}

function ProductGeometry({ kind }: { readonly kind: ShapeKind }) {
  switch (kind) {
    case "circle":
      return <sphereGeometry args={[0.8, 32, 20]} />;
    case "square":
      return <boxGeometry args={[1.35, 1.35, 0.55]} />;
    case "triangle":
      return <cylinderGeometry args={[0.9, 0.9, 0.55, 3]} />;
    case "diamond":
      return <octahedronGeometry args={[0.9, 0]} />;
  }
}
