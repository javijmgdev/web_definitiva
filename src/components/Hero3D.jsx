'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useRef, Suspense, useState, useEffect } from 'react';
import { FaCode, FaServer, FaCamera } from 'react-icons/fa';
import { SiJavascript, SiReact, SiNextdotjs, SiNodedotjs, SiPython, SiDocker } from 'react-icons/si';

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
          color="#b7ff00" 
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
        color="#b7ff00" 
        transparent 
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default function Hero3D() {
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const roles = ['DESARROLLADOR', 'CREADOR', 'PILOTO FPV', 'FOTÓGRAFO'];
  const [currentRole, setCurrentRole] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const techStack = [
    { icon: SiReact, name: 'React' },
    { icon: SiNextdotjs, name: 'Next.js' },
    { icon: SiNodedotjs, name: 'Node.js' },
    { icon: SiPython, name: 'Python' },
    { icon: SiDocker, name: 'Docker' },
  ];

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Canvas 3D en el fondo */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#b7ff00" />
          
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
          <motion.div
            className="flex items-center justify-center gap-2 text-sm md:text-base text-[var(--color-accent)] font-semibold mb-6 uppercase tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <FaCode className="text-xl" />
            Javier Jiménez | Full Stack Developer
          </motion.div>

          <motion.h1 
            className="text-6xl md:text-8xl lg:text-9xl font-black mb-6"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-white">CÓDIGO &</span>
            <br />
            <motion.span
              key={currentRole}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ color: 'var(--color-accent)' }}
              className="inline-block"
            >
              {roles[currentRole]}
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Desarrollador full-stack apasionado por crear experiencias web únicas.
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-3 mb-8 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <FaCamera className="text-2xl text-[var(--color-accent)]" />
            <p className="text-sm md:text-base">
              En mi tiempo libre, exploro el mundo con mi <span className="text-white font-semibold">cámara</span> y <span className="text-white font-semibold">dron FPV</span>
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <button
              onClick={() => scrollToSection('portfolio')}
              className="cursor-pointer px-8 py-4 bg-[var(--color-accent)] text-black font-bold text-lg rounded-full hover:scale-110 hover:shadow-2xl hover:shadow-[var(--color-accent)]/50 transition-all duration-300"
            >
              Ver Portfolio
            </button>
            
            <button
              onClick={() => scrollToSection('contacto')}
              className="cursor-pointer px-8 py-4 border-2 border-[var(--color-accent)] text-[var(--color-accent)] font-bold text-lg rounded-full hover:bg-[var(--color-accent)] hover:text-black transition-all duration-300"
            >
              Contactar
            </button>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p className="text-sm text-gray-500 mb-4 uppercase tracking-wider">Stack Tecnológico</p>
            <div className="flex flex-wrap justify-center gap-4">
              {techStack.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900/80 border border-gray-800 rounded-lg hover:border-[var(--color-accent)] transition-all group backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <tech.icon className="text-xl text-gray-400 group-hover:text-[var(--color-accent)] transition-colors" />
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{tech.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-sm">
              <h3 className="text-4xl md:text-5xl font-black text-[var(--color-accent)] mb-2">50+</h3>
              <p className="text-gray-400 text-sm">Proyectos Web</p>
            </div>
            <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-sm">
              <h3 className="text-4xl md:text-5xl font-black text-[var(--color-accent)] mb-2">5+</h3>
              <p className="text-gray-400 text-sm">Años Experiencia</p>
            </div>
            <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-sm">
              <h3 className="text-4xl md:text-5xl font-black text-[var(--color-accent)] mb-2">200+</h3>
              <p className="text-gray-400 text-sm">Fotos Capturadas</p>
            </div>
            <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-sm">
              <h3 className="text-4xl md:text-5xl font-black text-[var(--color-accent)] mb-2">∞</h3>
              <p className="text-gray-400 text-sm">Ideas Creativas</p>
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
