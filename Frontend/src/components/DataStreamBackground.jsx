import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// This component creates and animates a single "data stream"
const DataStream = ({ count, color, speed, positionZ }) => {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Create initial particle positions
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100; // time
      const factor = 20 + Math.random() * 100; // factor
      const speed = 0.01 + Math.random() / 200; // speed
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    // This runs on every frame, animating the particles
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;

      // This creates the flowing, weaving motion of the streams
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.max(1.5, Math.cos(t) * 5);

      particle.mx += (state.mouse.x * state.viewport.width - particle.mx) * 0.01;
      particle.my += (state.mouse.y * -1 * state.viewport.height - particle.my) * 0.01;

      // Update the dummy object's position, rotation, and scale
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        positionZ + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.05, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} roughness={0.2} metalness={0.8}/>
    </instancedMesh>
  );
};


const DataStreamBackground = () => {
    return (
        <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, zIndex: 0 }}>
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />

                {/* Create multiple data streams with different properties */}
                <DataStream count={200} color="#22c55e" speed={0.01} positionZ={0}/>
                <DataStream count={150} color="#1070b9" speed={0.015} positionZ={-1}/>
                <DataStream count={100} color="#6aa2d8" speed={0.02} positionZ={-2}/>

            </Canvas>
        </div>
    );
};

export default DataStreamBackground;