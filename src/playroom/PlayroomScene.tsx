import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { Group } from "three";
import { CanvasTexture, LinearFilter, SRGBColorSpace, Vector3 } from "three";

import { FrameDiagnostics } from "../engine/rendering/FrameDiagnostics";
import { useQuality } from "../engine/rendering/qualityContext";
import type { RoomId } from "../types/domain";
import { PORTALS, type PortalDefinition } from "./portalDefinitions";

interface PlayroomSceneProps {
  readonly transitioningTo: RoomId | undefined;
  readonly reducedMotion: boolean;
  readonly interactionLocked: boolean;
  readonly enabledRooms?: readonly RoomId[];
  readonly onSelectRoom: (roomId: RoomId) => void;
}

export function PlayroomScene({
  transitioningTo,
  reducedMotion,
  interactionLocked,
  enabledRooms = PORTALS.map((portal) => portal.id),
  onSelectRoom,
}: PlayroomSceneProps) {
  const quality = useQuality();
  useEffect(
    () => () => {
      document.body.style.cursor = "default";
    },
    [],
  );

  return (
    <div className="playroom-canvas" aria-label="Magical playroom scene">
      <Canvas
        camera={{ position: [0, 4.8, 10.5], fov: 42 }}
        dpr={quality.dpr}
        shadows={quality.shadows}
        fallback={<WebGLFallback />}
        gl={{ antialias: quality.antialias, alpha: false, powerPreference: "high-performance" }}
      >
        <FrameDiagnostics scene="playroom" />
        <color attach="background" args={["#e6dcff"]} />
        <ambientLight intensity={1.7} />
        <directionalLight position={[3, 8, 6]} intensity={2.2} />
        <CameraRig roomId={transitioningTo} reducedMotion={reducedMotion} />
        <PlayroomFloor />
        {PORTALS.filter((portal) => enabledRooms.includes(portal.id)).map((portal, index) => (
          <RoomPortal
            key={portal.id}
            portal={portal}
            idleOffset={index * 0.8}
            reducedMotion={reducedMotion || !quality.decorativeMotion}
            disabled={interactionLocked}
            onSelect={onSelectRoom}
          />
        ))}
      </Canvas>
    </div>
  );
}

function WebGLFallback() {
  return (
    <div className="webgl-fallback" role="status">
      <span aria-hidden="true">✨</span>
      <p>The playroom pictures are resting. The room buttons still work.</p>
    </div>
  );
}

function CameraRig({
  roomId,
  reducedMotion,
}: {
  roomId: RoomId | undefined;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  const target = useMemo(() => {
    if (!roomId || reducedMotion) return new Vector3(0, 4.8, 10.5);
    const portal = PORTALS.find((candidate) => candidate.id === roomId);
    return portal ? new Vector3(portal.position[0] * 0.45, 3.2, 7) : new Vector3(0, 4.8, 10.5);
  }, [reducedMotion, roomId]);

  useFrame((_, delta) => {
    camera.position.lerp(target, 1 - Math.exp(-delta * 4));
    camera.lookAt(0, 0.5, 0);
  });
  return null;
}

function PlayroomFloor() {
  return (
    <group>
      <mesh position={[0, -0.95, 0]} receiveShadow>
        <boxGeometry args={[13, 0.4, 5]} />
        <meshStandardMaterial color="#f2c99d" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.8, -2.2]}>
        <boxGeometry args={[13, 4, 0.3]} />
        <meshStandardMaterial color="#fff5dc" roughness={1} />
      </mesh>
    </group>
  );
}

interface RoomPortalProps {
  readonly portal: PortalDefinition;
  readonly idleOffset: number;
  readonly reducedMotion: boolean;
  readonly disabled: boolean;
  readonly onSelect: (roomId: RoomId) => void;
}

function RoomPortal({ portal, idleOffset, reducedMotion, disabled, onSelect }: RoomPortalProps) {
  const group = useRef<Group>(null);
  const face = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return;
    group.current.position.y =
      portal.position[1] + Math.sin(clock.elapsedTime * 1.4 + idleOffset) * 0.08;
    if (face.current) face.current.rotation.z = Math.sin(clock.elapsedTime + idleOffset) * 0.04;
  });

  return (
    <group ref={group} position={portal.position}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          if (!disabled) onSelect(portal.id);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = disabled ? "default" : "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <boxGeometry args={[1.9, 2.5, 1.1]} />
        <meshStandardMaterial color={portal.color} roughness={0.65} />
      </mesh>
      <group ref={face} position={[0, 0.15, 0.61]}>
        <mesh>
          <circleGeometry args={[0.62, 32]} />
          <meshStandardMaterial color={portal.accent} roughness={0.8} />
        </mesh>
        <PortalLetter letter={portal.letter} />
      </group>
      <mesh position={[0, -1.3, 0.1]}>
        <boxGeometry args={[2.3, 0.28, 1.5]} />
        <meshStandardMaterial color="#fff7e9" roughness={0.9} />
      </mesh>
    </group>
  );
}

function PortalLetter({ letter }: { readonly letter: PortalDefinition["letter"] }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;

    const context = canvas.getContext("2d");
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#49345f";
      context.font = "900 176px ui-rounded, 'Avenir Next', system-ui, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(letter, canvas.width / 2, canvas.height / 2 + 5);
    }

    const letterTexture = new CanvasTexture(canvas);
    letterTexture.colorSpace = SRGBColorSpace;
    letterTexture.minFilter = LinearFilter;
    return letterTexture;
  }, [letter]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, 0, 0.012]}>
      <planeGeometry args={[0.82, 0.82]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}
