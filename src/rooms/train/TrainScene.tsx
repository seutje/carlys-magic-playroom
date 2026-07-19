import { Canvas, type ThreeEvent, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plane, Vector3, type Group, type Mesh } from "three";

import { COLOR_HEX } from "../../content/colors";
import { diagnostics } from "../../engine/diagnostics/diagnostics";
import {
  isInsideTarget,
  PointerDragTracker,
  projectRayToPlane,
  snapSmoothing,
} from "../../engine/input/pointerDrag";
import { FrameDiagnostics } from "../../engine/rendering/FrameDiagnostics";
import { useQuality } from "../../engine/rendering/qualityContext";
import {
  createDuckModelInstance,
  disposeDuckModelInstance,
  disposeTrainModel,
  loadCargoCarModel,
  loadDuckModel,
  loadTrainModel,
} from "./train.model";
import { nextTrainDepartureX } from "./train.animation";
import { trainPlankToyX } from "./train.layout";
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
  const quality = useQuality();
  const available = definition.objects.filter((object) => !loadedObjectIds.includes(object.id));
  const loaded = loadedObjectIds
    .map((id) => definition.objects.find((object) => object.id === id))
    .filter((object): object is TrainObjectDefinition => Boolean(object));
  const duckModel = useOwnedTrainModel(loadDuckModel, "duck-model-load-failed");

  return (
    <div className="train-canvas" aria-label="Tiny Delivery Train scene">
      <Canvas
        camera={{ position: [0, 4.8, 11], fov: 42 }}
        dpr={quality.dpr}
        shadows={quality.shadows}
        gl={{ antialias: quality.antialias, powerPreference: "high-performance" }}
        fallback={<p className="webgl-fallback">The toy pictures are resting.</p>}
      >
        <FrameDiagnostics scene="train" />
        <color attach="background" args={["#bfe8f2"]} />
        <ambientLight intensity={1.8} />
        <directionalLight position={[2, 8, 5]} intensity={2.1} />
        <TrainWorld
          departing={departing}
          reducedMotion={reducedMotion}
          hinting={hintLevel > 0}
          loaded={loaded}
          duckModel={duckModel}
        />
        {available.map((object, index) => (
          <DraggableToy
            key={object.id}
            object={object}
            plankX={trainPlankToyX(index, available.length)}
            disabled={interactionLocked}
            reducedMotion={reducedMotion}
            highlighted={hintLevel >= 2 && isMatchingObject(definition, object)}
            faded={hintLevel >= 3 && !isMatchingObject(definition, object)}
            duckModel={duckModel}
            onDrop={onDrop}
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
  loaded,
  duckModel,
}: {
  departing: boolean;
  reducedMotion: boolean;
  hinting: boolean;
  loaded: readonly TrainObjectDefinition[];
  duckModel: Group | undefined;
}) {
  const train = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!train.current) return;
    train.current.position.x = nextTrainDepartureX(
      train.current.position.x,
      delta,
      departing,
      reducedMotion,
    );
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
        <TrainEngine />
        <CargoCar hinting={hinting} />
        {loaded.map((object, index) => (
          <ToyVisual
            key={object.id}
            object={object}
            position={[2.45 + index * 0.55, -0.62, 0.2]}
            scale={0.48}
            duckModel={duckModel}
          />
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

function TrainEngine() {
  const model = useOwnedTrainModel(loadTrainModel, "train-model-load-failed");

  return (
    <group position={[4.85, -1.48, 0]} rotation={[0, Math.PI, 0]} scale={0.55}>
      {model ? <primitive object={model} /> : <TrainEngineFallback />}
    </group>
  );
}

function CargoCar({ hinting }: { readonly hinting: boolean }) {
  const model = useOwnedTrainModel(loadCargoCarModel, "cargo-car-model-load-failed");

  return (
    <>
      <group position={[2.7, -1.48, 0]} scale={0.55}>
        {model ? <primitive object={model} /> : <CargoCarFallback />}
      </group>
      {hinting ? (
        <mesh position={[3, -0.92, 0]}>
          <boxGeometry args={[2.05, 1.15, 1.15]} />
          <meshStandardMaterial
            color="#ffd45e"
            emissive="#6c4c00"
            emissiveIntensity={0.35}
            transparent
            opacity={0.28}
            depthWrite={false}
          />
        </mesh>
      ) : null}
    </>
  );
}

function useOwnedTrainModel(loader: () => Promise<Group>, failureCode: string): Group | undefined {
  const [model, setModel] = useState<Group>();

  useEffect(() => {
    let disposed = false;
    let ownedModel: Group | undefined;

    void loader().then(
      (loadedModel) => {
        if (disposed) {
          disposeTrainModel(loadedModel);
          return;
        }
        ownedModel = loadedModel;
        setModel(loadedModel);
      },
      () => {
        if (!disposed) {
          diagnostics.record({ category: "asset", code: failureCode });
        }
      },
    );

    return () => {
      disposed = true;
      if (ownedModel) disposeTrainModel(ownedModel);
    };
  }, [failureCode, loader]);

  return model;
}

function TrainEngineFallback() {
  return (
    <>
      <mesh position={[0, 2.24, 0]} scale={[1.36, 1.64, 1.36]}>
        <boxGeometry />
        <meshStandardMaterial color="#db4f55" roughness={0.7} />
      </mesh>
      <mesh position={[-0.25, 4.42, 0]} scale={[0.64, 1, 0.64]}>
        <cylinderGeometry args={[0.35, 0.5, 1.1, 20]} />
        <meshStandardMaterial color="#5b4772" roughness={0.7} />
      </mesh>
      {[-0.72, 0.72].map((x) => (
        <mesh key={x} position={[x, 0.69, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.76, 0.76, 0.45, 20]} />
          <meshStandardMaterial color="#493b5e" roughness={0.8} />
        </mesh>
      ))}
    </>
  );
}

function CargoCarFallback() {
  return (
    <>
      <mesh position={[0, 1.38, 0]} scale={[1.45, 0.5, 0.76]}>
        <boxGeometry />
        <meshStandardMaterial color="#6b9bd1" roughness={0.7} />
      </mesh>
      {[-0.88, 0.88].map((x) => (
        <mesh key={x} position={[x, 0.48, 0.78]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.44, 0.44, 0.22, 20]} />
          <meshStandardMaterial color="#493b5e" roughness={0.8} />
        </mesh>
      ))}
    </>
  );
}

interface DraggableToyProps {
  readonly object: TrainObjectDefinition;
  readonly plankX: number;
  readonly disabled: boolean;
  readonly reducedMotion: boolean;
  readonly highlighted: boolean;
  readonly faded: boolean;
  readonly duckModel: Group | undefined;
  readonly onDrop: (objectId: string, insideTrain: boolean) => void;
}

function DraggableToy({
  object,
  plankX,
  disabled,
  reducedMotion,
  highlighted,
  faded,
  duckModel,
  onDrop,
}: DraggableToyProps) {
  const mesh = useRef<Mesh>(null);
  const drag = useRef(new PointerDragTracker());
  const target = useRef(new Vector3());
  const origin = useMemo(() => new Vector3(plankX, -0.75, 0.65), [plankX]);
  const interactionPlane = useMemo(() => new Plane(new Vector3(0, 0, 1), -0.65), []);

  useEffect(() => {
    target.current.copy(origin);
  }, [origin]);

  useEffect(() => {
    const cancel = () => {
      drag.current.cancel();
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
    mesh.current.position.lerp(target.current, snapSmoothing(delta, speed));
    const hintScale =
      highlighted && !reducedMotion ? 1 + Math.sin(performance.now() / 180) * 0.08 : 1;
    mesh.current.scale.setScalar(hintScale);
  });

  const moveToRayPlane = (event: ThreeEvent<PointerEvent>) => {
    const point = new Vector3();
    if (projectRayToPlane(event.ray, interactionPlane, point)) target.current.copy(point);
  };

  const finish = (event: ThreeEvent<PointerEvent>) => {
    if (!drag.current.owns(event.pointerId)) return;
    if (isPointerCaptureTarget(event.target)) event.target.releasePointerCapture(event.pointerId);
    const moved = drag.current.finish(event.pointerId);
    const inside = isInsideTarget(target.current, {
      left: 0.8,
      right: 4.8,
      top: -1.9,
      bottom: 1.7,
    });
    if (moved) onDrop(object.id, inside);
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
        drag.current.begin(event.pointerId, { x: event.clientX, y: event.clientY });
        if (isPointerCaptureTarget(event.target)) event.target.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (disabled || !drag.current.move(event.pointerId, event)) return;
        moveToRayPlane(event);
      }}
      onPointerUp={finish}
      onPointerCancel={(event) => {
        if (!drag.current.owns(event.pointerId)) return;
        if (isPointerCaptureTarget(event.target)) {
          event.target.releasePointerCapture(event.pointerId);
        }
        drag.current.cancel();
        target.current.copy(origin);
      }}
    >
      <sphereGeometry args={[object.category === "duck" ? 0.95 : 0.72, 20, 16]} />
      {object.category === "duck" ? (
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      ) : (
        <meshStandardMaterial
          color={COLOR_HEX[object.color]}
          transparent={faded}
          opacity={faded ? 0.15 : 1}
          roughness={0.7}
        />
      )}
      {object.category === "duck" ? (
        <DuckVisual model={duckModel} color={COLOR_HEX[object.color]} />
      ) : (
        <ToyDecoration object={object} />
      )}
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
  duckModel,
}: {
  object: TrainObjectDefinition;
  position: readonly [number, number, number];
  scale: number;
  duckModel: Group | undefined;
}) {
  return (
    <group position={position} scale={scale}>
      {object.category === "duck" ? (
        <DuckVisual model={duckModel} color={COLOR_HEX[object.color]} />
      ) : (
        <>
          <mesh>
            <sphereGeometry args={[0.72, 20, 16]} />
            <meshStandardMaterial color={COLOR_HEX[object.color]} roughness={0.7} />
          </mesh>
          <ToyDecoration object={object} />
        </>
      )}
    </group>
  );
}

function DuckVisual({
  model,
  color,
}: {
  readonly model: Group | undefined;
  readonly color: string;
}) {
  const instance = useMemo(
    () => (model ? createDuckModelInstance(model, color) : undefined),
    [color, model],
  );

  useEffect(
    () => () => {
      if (instance) disposeDuckModelInstance(instance);
    },
    [instance],
  );

  return (
    <group scale={0.8}>
      {instance ? <primitive object={instance} /> : <DuckFallback color={color} />}
    </group>
  );
}

function DuckFallback({ color }: { readonly color: string }) {
  return (
    <>
      <mesh>
        <sphereGeometry args={[0.72, 20, 16]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0.35, 0.58, 0]}>
        <sphereGeometry args={[0.42, 16, 12]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0.75, 0.55, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.16, 0.42, 12]} />
        <meshStandardMaterial color="#ef8b37" />
      </mesh>
    </>
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
