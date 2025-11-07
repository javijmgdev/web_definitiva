'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF, Text3D, Center } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

function Camera3D() {
  const cameraRef = useRef();
  
  useFrame(({ clock }) => {
    if (cameraRef.current) {
      cameraRef.current.position.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.5;
      cameraRef.current.position.y = Math.cos(clock.getElapsedTime() * 0.2) * 0.3;
      cameraRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <group ref={cameraRef}>
      {/* Cuerpo de la cámara */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 1.5, 1]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* Lente */}
      <mesh position={[0, 0, 0.6]}>
        <cylinderGeometry args={[0.6, 0.6, 0.3, 32]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#333" metalness={1} roughness={0.1} />
      </mesh>
      
      {/* Cristal del lente */}
      <mesh position={[0, 0, 0.8]}>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} rotation={[Math.PI / 2, 0, 0]} />
        <meshPhysicalMaterial 
          color="#4a9eff" 
          metalness={0.9} 
          roughness={0.1} 
          transmission={0.5}
          transparent={true}
        />
      </mesh>
      
      {/* Flash */}
      <mesh position={[0.8, 0.5, 0.3]}>
        <boxGeometry args={[0.3, 0.15, 0.1]} />
        <meshStandardMaterial emissive="#fff" emissiveIntensity={2} />
      </mesh>
      
      {/* Botón */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.15, 16]} />
        <meshStandardMaterial color="#ff0000" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function FloatingParticles() {
  const particlesRef = useRef();
  const particleCount = 100;
  
  const particles = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    particles[i] = (Math.random() - 0.5) * 20;
  }

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.1} 
        color="var(--color-accent)" 
        transparent 
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default function Hero3D() {
  const scrollToPortfolio = () => {
    document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Canvas 3D en el fondo */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ff88" />
          
          <Suspense fallback={null}>
            <Camera3D />
            <FloatingParticles />
          </Suspense>
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      {/* Contenido sobre el 3D */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.h1 
            className="text-6xl md:text-8xl lg:text-9xl font-black mb-6"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-white">FOTÓGRAFO</span>
            <br />
            <span 
              style={{ color: 'var(--color-accent)' }}
              className="inline-block"
            >
              PROFESIONAL
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Capturando momentos únicos con creatividad y pasión.
            <br />
            Especializado en retratos, bodas y fotografía comercial.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <button
              onClick={scrollToPortfolio}
              className="cursor-pointer px-8 py-4 bg-[var(--color-accent)] text-black font-bold text-lg rounded-full hover:scale-110 hover:shadow-2xl hover:shadow-[var(--color-accent)]/50 transition-all duration-300"
            >
              Ver Portfolio
            </button>
            
            <a
              href="#contacto"
              className="cursor-pointer px-8 py-4 border-2 border-[var(--color-accent)] text-[var(--color-accent)] font-bold text-lg rounded-full hover:bg-[var(--color-accent)] hover:text-black transition-all duration-300"
            >
              Contactar
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            <div className="text-center">
              <h3 className="text-4xl md:text-5xl font-black text-[var(--color-accent)] mb-2">500+</h3>
              <p className="text-gray-400 text-sm md:text-base">Proyectos</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl md:text-5xl font-black text-[var(--color-accent)] mb-2">8</h3>
              <p className="text-gray-400 text-sm md:text-base">Años Experiencia</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl md:text-5xl font-black text-[var(--color-accent)] mb-2">100%</h3>
              <p className="text-gray-400 text-sm md:text-base">Satisfacción</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-[var(--color-accent)] rounded-full flex justify-center pt-2">
          <motion.div
            className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
