import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';

function AICore() {
  const coreRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.3;
      coreRef.current.rotation.x += delta * 0.15;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * 0.2;
      outerRingRef.current.rotation.x += delta * 0.1;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.y -= delta * 0.25;
      innerRingRef.current.rotation.z -= delta * 0.15;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Glowing AI Core - Bright Aesthetic */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          color="#0F766E"
          emissive="#06B6D4"
          emissiveIntensity={0.6}
          roughness={0.25}
          metalness={0.8}
          wireframe={true}
        />
      </mesh>

      {/* Internal Core Soft Sphere */}
      <mesh scale={0.75}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#2563EB"
          emissive="#3B82F6"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* Outer Ring 1 */}
      <group ref={outerRingRef}>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[2.0, 0.03, 16, 64]} />
          <meshStandardMaterial color="#0F766E" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>

      {/* Inner Ring 2 */}
      <group ref={innerRingRef}>
        <mesh rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
          <torusGeometry args={[1.6, 0.025, 16, 64]} />
          <meshStandardMaterial color="#2563EB" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

function OrbitingNode({
  position,
  label,
  color,
  shape = 'box',
  speed = 1,
  floatRange = 0.4,
}: {
  position: [number, number, number];
  label: string;
  color: string;
  shape?: 'box' | 'octahedron' | 'cylinder' | 'dodecahedron';
  speed?: number;
  floatRange?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4 * speed;
      meshRef.current.rotation.x += delta * 0.2 * speed;
    }
  });

  return (
    <Float
      speed={2 * speed}
      rotationIntensity={0.8}
      floatIntensity={floatRange * 2}
      position={position}
    >
      <group>
        <mesh ref={meshRef}>
          {shape === 'box' && <boxGeometry args={[0.6, 0.75, 0.1]} />}
          {shape === 'octahedron' && <octahedronGeometry args={[0.45]} />}
          {shape === 'cylinder' && <cylinderGeometry args={[0.38, 0.38, 0.18, 24]} />}
          {shape === 'dodecahedron' && <dodecahedronGeometry args={[0.42]} />}
          <meshStandardMaterial
            color={color}
            roughness={0.2}
            metalness={0.6}
          />
        </mesh>

        <Text
          position={[0, -0.68, 0]}
          fontSize={0.22}
          color="#0B1220"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </group>
    </Float>
  );
}

function ParticleField({ count = 100 }) {
  const points = useMemo(() => {
    const coords = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      coords[i * 3] = (Math.random() - 0.5) * 16;
      coords[i * 3 + 1] = (Math.random() - 0.5) * 12;
      coords[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return coords;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.03;
      pointsRef.current.rotation.x += delta * 0.015;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#0F766E"
        transparent={true}
        opacity={0.45}
        sizeAttenuation={true}
      />
    </points>
  );
}

export const HeroScene: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[460px] md:min-h-[560px] relative">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: 'auto' }}
      >
        <ambientLight intensity={1.1} />
        <pointLight position={[10, 10, 10]} intensity={1.8} color="#06B6D4" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#2563EB" />
        <directionalLight position={[0, 8, 6]} intensity={1.0} color="#FFFFFF" />

        <ParticleField count={100} />
        <AICore />

        {/* Orbiting Career Nodes with bright theme high contrast */}
        <OrbitingNode
          position={[-3.2, 1.4, 0.5]}
          label="Resume"
          color="#0F766E"
          shape="box"
          speed={0.9}
        />
        <OrbitingNode
          position={[3.0, 1.8, -0.2]}
          label="Skills NLP"
          color="#2563EB"
          shape="octahedron"
          speed={1.1}
        />
        <OrbitingNode
          position={[-2.8, -1.8, 0.3]}
          label="Experience"
          color="#0284C7"
          shape="cylinder"
          speed={0.8}
        />
        <OrbitingNode
          position={[3.1, -1.5, 0.4]}
          label="Education"
          color="#0D9488"
          shape="dodecahedron"
          speed={1.0}
        />
        <OrbitingNode
          position={[0, 2.7, -0.6]}
          label="Match 94%"
          color="#059669"
          shape="octahedron"
          speed={1.2}
          floatRange={0.6}
        />
        <OrbitingNode
          position={[0, -2.6, -0.5]}
          label="Career Fit"
          color="#1D4ED8"
          shape="box"
          speed={0.7}
        />
      </Canvas>
    </div>
  );
};
