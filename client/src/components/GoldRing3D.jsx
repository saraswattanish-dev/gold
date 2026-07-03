import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, Stars } from '@react-three/drei';

const ProceduralRing = () => {
  const ringRef = useRef(null);

  // Slow auto rotation in addition to OrbitControls autoRotate
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
      ringRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.2;
    }
  });

  return (
    <group ref={ringRef}>
      {/* Main Gold Band */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[1.6, 0.35, 32, 100]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={1.0}
          roughness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Decorative Bezel or Gem Holder (optional highlight overlay) */}
      <mesh position={[0, 0, 1.8]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 0.3, 8]} />
        <meshStandardMaterial
          color="#aa7c11"
          metalness={1.0}
          roughness={0.2}
        />
      </mesh>

      {/* procedurally render a diamond on top */}
      <mesh position={[0, 0, 1.98]} castShadow>
        <octahedronGeometry args={[0.26]} />
        <meshStandardMaterial
          color="#e0f2fe"
          metalness={0.9}
          roughness={0.05}
          opacity={0.85}
          transparent={true}
        />
      </mesh>
    </group>
  );
};

const GoldRing3D = () => {
  return (
    <div className="w-full h-full relative min-h-[350px] md:min-h-[400px]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Cinematic Studio Lights */}
        <ambientLight intensity={0.5} />
        
        {/* Key Light */}
        <directionalLight position={[5, 10, 5]} intensity={2.0} color="#fff" />
        
        {/* Warm Gold Reflection Light */}
        <directionalLight position={[-5, 5, -5]} intensity={1.2} color="#fdf6c3" />
        
        {/* Under Rim Glow */}
        <pointLight position={[0, -4, 0]} intensity={1.5} color="#d4af37" />
        
        <Center>
          <ProceduralRing />
        </Center>
        
        {/* Orbit Control configuration */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          makeDefault
        />
      </Canvas>
      
      {/* Floating Sparkles overlays */}
      <div className="absolute top-4 right-4 pointer-events-none text-[9px] font-bold text-gold-500 uppercase tracking-widest bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
        3D Canvas Enabled
      </div>
    </div>
  );
};

export default GoldRing3D;
