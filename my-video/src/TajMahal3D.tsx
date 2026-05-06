import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// ── Palette ──────────────────────────────────────────────────────────────────
const MARBLE = "#F8F4EC";
const MARBLE_SHADOW = "#C8C0B0";
const GARDEN = "#1E3D28";
const WATER = "#1A3A5C";
const SKY_TOP = "#0A0F2A";

// ── Shared marble material ────────────────────────────────────────────────────
function MarbleMesh({
  geometry,
  position,
  rotation,
  shadow = true,
}: {
  geometry: React.ReactNode;
  position: [number, number, number];
  rotation?: [number, number, number];
  shadow?: boolean;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow={shadow} receiveShadow={shadow}>
      {geometry}
      <meshStandardMaterial
        color={MARBLE}
        roughness={0.25}
        metalness={0.05}
      />
    </mesh>
  );
}

// ── Minaret (thin tower with dome cap) ───────────────────────────────────────
function Minaret({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* shaft */}
      <MarbleMesh
        geometry={<cylinderGeometry args={[0.55, 0.7, 16, 12]} />}
        position={[0, 8, 0]}
      />
      {/* balcony ring */}
      <MarbleMesh
        geometry={<cylinderGeometry args={[1, 1, 0.4, 12]} />}
        position={[0, 13.5, 0]}
      />
      {/* top dome */}
      <MarbleMesh
        geometry={<sphereGeometry args={[0.85, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />}
        position={[0, 14.2, 0]}
      />
      {/* finial */}
      <MarbleMesh
        geometry={<cylinderGeometry args={[0.12, 0.12, 1.8, 8]} />}
        position={[0, 15.5, 0]}
      />
    </group>
  );
}

// ── Corner chhatri (small domed kiosk on roof corners) ────────────────────────
function Chhatri({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 9.5, z]}>
      <MarbleMesh
        geometry={<cylinderGeometry args={[0.7, 0.7, 3.5, 10]} />}
        position={[0, 1.75, 0]}
      />
      <MarbleMesh
        geometry={<sphereGeometry args={[0.85, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />}
        position={[0, 4, 0]}
      />
    </group>
  );
}

// ── Main Taj Mahal geometry ───────────────────────────────────────────────────
function TajGeometry() {
  return (
    <group>
      {/* === Ground terrace === */}
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <boxGeometry args={[32, 0.5, 28]} />
        <meshStandardMaterial color={MARBLE_SHADOW} roughness={0.5} />
      </mesh>

      {/* === Raised plinth === */}
      <MarbleMesh
        geometry={<boxGeometry args={[18, 1.5, 18]} />}
        position={[0, 1, 0]}
      />

      {/* === Main building body === */}
      <MarbleMesh
        geometry={<boxGeometry args={[9.5, 9.5, 9.5]} />}
        position={[0, 6.75, 0]}
      />

      {/* === Front iwan (recessed arch cutout illusion — slightly darker face) === */}
      <mesh position={[0, 6.75, 4.76]} receiveShadow>
        <boxGeometry args={[4, 7, 0.1]} />
        <meshStandardMaterial color={MARBLE_SHADOW} roughness={0.4} />
      </mesh>

      {/* === Central dome drum === */}
      <MarbleMesh
        geometry={<cylinderGeometry args={[3.6, 4, 2.5, 16]} />}
        position={[0, 12, 0]}
      />
      {/* === Central dome === */}
      <MarbleMesh
        geometry={<sphereGeometry args={[3.8, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6]} />}
        position={[0, 13.3, 0]}
      />
      {/* === Dome finial === */}
      <MarbleMesh
        geometry={<cylinderGeometry args={[0.18, 0.18, 2.5, 8]} />}
        position={[0, 17.5, 0]}
      />

      {/* === 4 corner chhatris === */}
      <Chhatri x={4.2} z={4.2} />
      <Chhatri x={-4.2} z={4.2} />
      <Chhatri x={4.2} z={-4.2} />
      <Chhatri x={-4.2} z={-4.2} />

      {/* === 4 minarets === */}
      <Minaret x={12} z={10} />
      <Minaret x={-12} z={10} />
      <Minaret x={12} z={-10} />
      <Minaret x={-12} z={-10} />

      {/* === Reflecting pool (front) === */}
      <mesh position={[0, -0.22, 16]} receiveShadow>
        <boxGeometry args={[5, 0.08, 14]} />
        <meshStandardMaterial
          color={WATER}
          roughness={0.0}
          metalness={0.8}
          envMapIntensity={1}
        />
      </mesh>

      {/* === Garden paths === */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[32, 0.1, 28]} />
        <meshStandardMaterial color={GARDEN} roughness={0.9} />
      </mesh>
    </group>
  );
}

// ── Skybox gradient (two large planes) ───────────────────────────────────────
function Sky() {
  return (
    <mesh position={[0, 20, -60]}>
      <planeGeometry args={[200, 120]} />
      <meshBasicMaterial color={SKY_TOP} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars() {
  const positions = React.useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 200; i++) {
      arr.push(
        (Math.random() - 0.5) * 160,
        8 + Math.random() * 60,
        -30 - Math.random() * 80
      );
    }
    return new Float32Array(arr);
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.25} color="#FFFFFF" sizeAttenuation />
    </points>
  );
}

// ── Animated scene (driven by Remotion frame) ────────────────────────────────
function TajScene({ progress }: { progress: number }) {
  // Camera orbits from side-right to frontal view
  const angle = interpolate(progress, [0, 1], [Math.PI * 0.35, 0]);
  const camR = interpolate(progress, [0, 1], [36, 28]);
  const camY = interpolate(progress, [0, 1], [18, 10]);

  const camX = Math.sin(angle) * camR;
  const camZ = Math.cos(angle) * camR;

  return (
    <>
      {/* Camera */}
      <perspectiveCamera
        position={[camX, camY, camZ]}
        fov={50}
        onUpdate={(cam) => cam.lookAt(0, 6, 0)}
        attach="camera"
      />

      {/* Lighting — dusk/moonlight atmosphere */}
      <ambientLight intensity={0.35} color="#5570A0" />
      <directionalLight
        position={[-15, 30, 10]}
        intensity={2.2}
        color="#FFE8C0"
        castShadow
      />
      {/* Front fill */}
      <pointLight position={[0, 10, 25]} intensity={0.6} color="#C0D0FF" />
      {/* Upward glow on Taj */}
      <pointLight position={[0, -1, 5]} intensity={0.4} color="#FFFDE8" />

      <Sky />
      <Stars />
      <TajGeometry />
    </>
  );
}

// ── Exported component ────────────────────────────────────────────────────────
export const TajMahal3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <ThreeCanvas width={width} height={height} shadows>
      <TajScene progress={progress} />
    </ThreeCanvas>
  );
};
