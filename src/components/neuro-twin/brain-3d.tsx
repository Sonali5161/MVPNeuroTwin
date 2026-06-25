'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useNeuroStore } from '@/lib/neuro-store';

function BrainCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const selectedPatient = useNeuroStore((s) => s.selectedPatient);
  const degradation = selectedPatient ? 1 - selectedPatient.mriScore / 100 : 0.3;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color={degradation > 0.5 ? '#f97316' : degradation > 0.3 ? '#eab308' : '#14b8a6'}
          emissive={degradation > 0.5 ? '#f97316' : degradation > 0.3 ? '#eab308' : '#14b8a6'}
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.1}
          distort={0.25 + degradation * 0.3}
          speed={2}
          transparent
          opacity={0.85}
        />
      </Sphere>
    </Float>
  );
}

function NeuralParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.8 + Math.random() * 0.8;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#14b8a6"
        size={0.03}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function ConnectionLines() {
  const linesRef = useRef<THREE.LineSegments>(null);
  const selectedPatient = useNeuroStore((s) => s.selectedPatient);
  const lineCount = 40;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(lineCount * 6);
    const col = new Float32Array(lineCount * 6);
    for (let i = 0; i < lineCount; i++) {
      const theta1 = Math.random() * Math.PI * 2;
      const phi1 = Math.acos(2 * Math.random() - 1);
      const r1 = 1.5;
      pos[i * 6] = r1 * Math.sin(phi1) * Math.cos(theta1);
      pos[i * 6 + 1] = r1 * Math.sin(phi1) * Math.sin(theta1);
      pos[i * 6 + 2] = r1 * Math.cos(phi1);
      const theta2 = theta1 + (Math.random() - 0.5) * 1.5;
      const phi2 = phi1 + (Math.random() - 0.5) * 1.0;
      const r2 = 1.5;
      pos[i * 6 + 3] = r2 * Math.sin(phi2) * Math.cos(theta2);
      pos[i * 6 + 4] = r2 * Math.sin(phi2) * Math.sin(theta2);
      pos[i * 6 + 5] = r2 * Math.cos(phi2);
      const degradation = selectedPatient ? selectedPatient.mriScore / 100 : 0.7;
      const intensity = 0.3 + Math.random() * 0.7 * degradation;
      col[i * 6] = 0.08 * intensity;
      col[i * 6 + 1] = 0.72 * intensity;
      col[i * 6 + 2] = 0.65 * intensity;
      col[i * 6 + 3] = 0.08 * intensity;
      col[i * 6 + 4] = 0.72 * intensity;
      col[i * 6 + 5] = 0.65 * intensity;
    }
    return { positions: pos, colors: col };
  }, [selectedPatient?.mriScore]);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
  });

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial vertexColors transparent opacity={0.4} />
    </lineSegments>
  );
}

export default function Brain3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#14b8a6" />
      <directionalLight position={[-5, -3, 2]} intensity={0.3} color="#f97316" />
      <pointLight position={[0, 0, 3]} intensity={0.5} color="#14b8a6" />
      <BrainCore />
      <NeuralParticles />
      <ConnectionLines />
    </Canvas>
  );
}