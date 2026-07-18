import { Canvas, type ThreeEvent, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Plane, Vector3, type Group, type Mesh } from "three";

import { COLOR_HEX } from "../../content/colors";
import type { TrainActivityDefinition, TrainObjectDefinition } from "./train.types";
import { isMatchingObject } from "./train.validation";

interface TrainSceneProps {
  readonly definition: TrainActivityDefinition;
  readonly loadedObjectIds: readonly string[];
  readonly hintLevel: 0 | 1 | 2 | 3;
  readonly interactionLocked: boolean;
  readonly reducedMotion: boolean;
  readonly departing: boolean;
  readonly onDrop: (objectId: string, insideTrain: boolean) => void;
}

export function TrainScene({
  definition,
  loadedObjectIds,
  hintLevel,
  interactionLocked,
  reducedMotion,
  departing,
  onDrop,
}: TrainSceneProps) {
  const available = definition.objects.filter((object) => !loadedObjectIds.includes(object.id));
  const loaded = loadedObjectIds
    .map((id) => definition.objects.find((object) => object.id === id))
    .filter((object): object is TrainObjectDefinition => Boolean(object));

  return (
    <div className="train-canvas" aria-label="Tiny Delivery Train scene">
      <Canvas
        camera={{ position: [0, 4.8, 11], fov: 42 }}
        dpr={[1, 1.5]}
        fallback={<p className="webgl-fallback">The toy pictures are resting.</p>}
      >
        <color attach="background" args={["#bfe8f2"]} />
        <ambientLight intensity={1.8} />
        <directionalLight position={[2, 8, 5]} intensity={2.1} />
        <TrainWorld departing={departing} reducedMotion={reducedMotion} hinting={hintLevel > 0} />
        {available.map((object) => (
          <DraggableToy
            key={object.id}
            object={object}
            disabled={interactionLocked}
            reducedMotion={reducedMotion}
            highlighted={hintLevel >= 2 && isMatchingObject(definition, object)}
            faded={hintLevel >= 3 && !isMatchingObject(definition, object)}
            onDrop={onDrop}
          />
        ))}
        {loaded.map((object, index) => (
          <ToyVisual
            key={object.id}
            object={object}
            position={[2.35 + index * 0.75, 0.1, 0.75]}
            scale={0.62}
          />
        ))}
      </Canvas>
    </div>
  );
}

function TrainWorld({
  departing,
  reducedMotion,
  hinting,
}: {
  departing: boolean;
  reducedMotion: boolean;
  hinting: boolean;
}) {
  const train = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!train.current || !departing || reducedMotion) return;
    train.current.position.x += delta * 4.5;
  });

  return (
    <group>
      <mesh position={[0, -1.75, 0]}>
        <boxGeometry args={[13, 0.35, 4]} />
        <meshStandardMaterial color="#76b861" roughness={1} />
      </mesh>
      <mesh position={[-1.8, -1.42, 0.3]}>
        <boxGeometry args={[6.5, 0.25, 1.5]} />
        <meshStandardMaterial color="#e9bd82" roughness={0.9} />
      </mesh>
      <group ref={train}>
        <mesh position={[4.4, -0.25, 0]}>
          <boxGeometry args={[1.5, 1.8, 1.5]} />
          <meshStandardMaterial color="#db4f55" roughness={0.7} />
        </mesh>
        <mesh position={[4.55, 0.95, 0]}>
          <cylinderGeometry args={[0.35, 0.5, 1.1, 20]} />
          <meshStandardMaterial color="#5b4772" roughness={0.7} />
        </mesh>
        <mesh position={[2.8, -0.2, 0]}>
          <boxGeometry args={[2.6, 1.4, 1.8]} />
          <meshStandardMaterial
            color={hinting ? "#ffd45e" : "#6b9bd1"}
            emissive={hinting ? "#6c4c00" : "#000000"}
            emissiveIntensity={hinting ? 0.25 : 0}
            roughness={0.7}
          />
        </mesh>
        {[2.1, 3.5, 4.05, 4.8].map((x) => (
          <mesh key={x} position={[x, -1.1, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.25, 20]} />
            <meshStandardMaterial color="#493b5e" roughness={0.8} />
          </mesh>
        ))}
      </group>
      <mesh position={[6, 0.2, -1.3]}>
        <boxGeometry args={[1.8, 3.4, 0.4]} />
        <meshStandardMaterial color="#f0a967" roughness={1} />
      </mesh>
      <mesh position={[6, 2.1, -1.3]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[1.5, 1.5, 0.5]} />
        <meshStandardMaterial color="#9c65b5" roughness={1} />
      </mesh>
    </group>
  );
}

interface DraggableToyProps {
  readonly object: TrainObjectDefinition;
  readonly disabled: boolean;
  readonly reducedMotion: boolean;
  readonly highlighted: boolean;
  readonly faded: boolean;
  readonly onDrop: (objectId: string, insideTrain: boolean) => void;
}

function DraggableToy({
  object,
  disabled,
  reducedMotion,
  highlighted,
  faded,
  onDrop,
}: DraggableToyProps) {
  const mesh = useRef<Mesh>(null);
  const pointerId = useRef<number | undefined>(undefined);
  const startPointer = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const target = useRef(new Vector3());
  const origin = useMemo(
    () => new Vector3(-4.5 + object.startSlot * 1.35, -0.75, 0.65),
    [object.startSlot],
  );
  const interactionPlane = useMemo(() => new Plane(new Vector3(0, 0, 1), -0.65), []);

  useEffect(() => {
    target.current.copy(origin);
  }, [origin]);

  useEffect(() => {
    const cancel = () => {
      pointerId.current = undefined;
      dragging.current = false;
      target.current.copy(origin);
    };
    const onVisibility = () => {
      if (document.hidden) cancel();
    };
    window.addEventListener("blur", cancel);
    window.addEventListener("orientationchange", cancel);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", cancel);
      window.removeEventListener("orientationchange", cancel);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [origin]);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const speed = reducedMotion ? 30 : 12;
    mesh.current.position.lerp(target.current, 1 - Math.exp(-delta * speed));
    const hintScale =
      highlighted && !reducedMotion ? 1 + Math.sin(performance.now() / 180) * 0.08 : 1;
    mesh.current.scale.setScalar(hintScale);
  });

  const moveToRayPlane = (event: ThreeEvent<PointerEvent>) => {
    const point = new Vector3();
    if (event.ray.intersectPlane(interactionPlane, point)) target.current.copy(point);
  };

  const finish = (event: ThreeEvent<PointerEvent>) => {
    if (pointerId.current !== event.pointerId) return;
    if (isPointerCaptureTarget(event.target)) event.target.releasePointerCapture(event.pointerId);
    pointerId.current = undefined;
    const inside = Math.abs(target.current.x - 2.8) < 2 && Math.abs(target.current.y + 0.1) < 1.8;
    if (dragging.current) onDrop(object.id, inside);
    dragging.current = false;
    target.current.copy(origin);
  };

  return (
    <mesh
      ref={mesh}
      position={origin}
      visible={!faded}
      onPointerDown={(event) => {
        if (disabled) return;
        event.stopPropagation();
        pointerId.current = event.pointerId;
        startPointer.current = { x: event.clientX, y: event.clientY };
        if (isPointerCaptureTarget(event.target)) event.target.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (pointerId.current !== event.pointerId || disabled) return;
        const distance = Math.hypot(
          event.clientX - startPointer.current.x,
          event.clientY - startPointer.current.y,
        );
        if (distance < 6) return;
        dragging.current = true;
        moveToRayPlane(event);
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
    >
      <sphereGeometry args={[0.72, 20, 16]} />
      <meshStandardMaterial
        color={COLOR_HEX[object.color]}
        transparent={faded}
        opacity={faded ? 0.15 : 1}
        roughness={0.7}
      />
      <ToyDecoration object={object} />
    </mesh>
  );
}

interface PointerCaptureTarget extends EventTarget {
  setPointerCapture(pointerId: number): void;
  releasePointerCapture(pointerId: number): void;
}

function isPointerCaptureTarget(value: EventTarget | null): value is PointerCaptureTarget {
  return Boolean(value && "setPointerCapture" in value && "releasePointerCapture" in value);
}

function ToyVisual({
  object,
  position,
  scale,
}: {
  object: TrainObjectDefinition;
  position: readonly [number, number, number];
  scale: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.72, 20, 16]} />
        <meshStandardMaterial color={COLOR_HEX[object.color]} roughness={0.7} />
      </mesh>
      <ToyDecoration object={object} />
    </group>
  );
}

function ToyDecoration({ object }: { object: TrainObjectDefinition }) {
  if (object.category === "duck") {
    return (
      <group>
        <mesh position={[0.35, 0.58, 0]}>
          <sphereGeometry args={[0.42, 16, 12]} />
          <meshStandardMaterial color={COLOR_HEX[object.color]} roughness={0.7} />
        </mesh>
        <mesh position={[0.75, 0.55, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.16, 0.42, 12]} />
          <meshStandardMaterial color="#ef8b37" />
        </mesh>
      </group>
    );
  }
  if (object.category === "apple") {
    return (
      <mesh position={[0, 0.72, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.08, 0.1, 0.45, 10]} />
        <meshStandardMaterial color="#5d713f" />
      </mesh>
    );
  }
  return (
    <mesh rotation={[0, 0, Math.PI / 4]}>
      <torusGeometry args={[0.5, 0.08, 8, 24]} />
      <meshStandardMaterial color="#fff7e8" />
    </mesh>
  );
}
