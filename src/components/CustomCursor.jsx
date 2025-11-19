'use client';

import { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial, Environment, useMouse } from '@react-three/drei';
import { motion, useSpring } from 'framer-motion';
import * as THREE from 'three';

export default function CrystalCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const meshRef = useRef();
  const { camera, viewport } = useThree();

  // Suavizado de posición con spring (integrado con Framer Motion para consistencia)
  const springPos = useSpring({ x: 0, y: 0 }, { damping: 25, stiffness: 350, mass: 0.2 });

  // Geometría de flecha 3D (extrusión simple para forma Windows-like)
  const arrowGeometry = useRef(new THREE.ExtrudeGeometry(
    new THREE.Shape()
      .moveTo(0, 0)
      .lineTo(1, 0.3)
      .lineTo(0.8, 0.3)
      .lineTo(0.8, 1)
      .lineTo(0.2, 1)
      .lineTo(0.2, 0.3)
      .lineTo(0, 0.3)
      .moveTo(0.2, 0.7)
      .lineTo(0.8, 0.7),
    { depth: 0.1, bevelEnabled: false } // Extrusión delgada para cursor 3D
  )).current;

  useEffect(() => {
    setIsMounted(true);
    const checkTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(checkTouch());

    if (isTouchDevice) return;

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      springPos.x.set(e.clientX / window.innerWidth - 0.5);
      springPos.y.set(-(e.clientY / window.innerHeight - 0.5));
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleHoverElements = () => {
      const els = document.querySelectorAll('button, a, input, textarea, .cursor-pointer');
      els.forEach((el) => {
        el.addEventListener('mouseenter', () => setIsHovering(true));
        el.addEventListener('mouseleave', () => setIsHovering(false));
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    const observer = new MutationObserver(handleHoverElements);
    observer.observe(document.body, { childList: true, subtree: true });
    handleHoverElements();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      observer.disconnect();
    };
  }, [isTouchDevice, springPos]);

  if (!isMounted || isTouchDevice) return null;

  return (
    <>
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          pointerEvents: 'none',
          opacity: isHovering ? 0.9 : 1,
          scale: (isHovering || isClicking) ? 1.1 : 1,
        }}
        transition={{ duration: 0.1 }}
      >
        <Canvas
          camera={{ position: [0, 0, 1], fov: 50 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          }}
          style={{ background: 'transparent' }}
          eventSource={document.body} // Para tracking global sin interferir
        >
          <Environment preset="city" /> {/* Iluminación ambiental para reflejos realistas */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />

          <CursorMesh 
            mousePos={mousePos}
            springPos={springPos}
            isHovering={isHovering}
            isClicking={isClicking}
            geometry={arrowGeometry}
            viewport={viewport}
          />
        </Canvas>
      </motion.div>

      <style jsx global>{`
        body { cursor: none; }
      `}</style>
    </>
  );
}

function CursorMesh({ mousePos, springPos, isHovering, isClicking, geometry, viewport }) {
  const ref = useRef();
  const mouse = useMouse(); // Para coordenadas precisas en 3D

  useFrame(() => {
    if (ref.current) {
      // Convertir posición 2D a 3D (mouse following en plano XY, Z fijo para overlay)
      const x = (mousePos.x / window.innerWidth - 0.5) * viewport.width * 0.1; // Escala grande
      const y = -(mousePos.y / window.innerHeight - 0.5) * viewport.height * 0.1;
      ref.current.position.set(x, y, 0);

      // Rotación sutil para efecto dinámico en hover/click
      if (isHovering || isClicking) {
        ref.current.rotation.z += 0.05;
      }
    }
  });

  return (
    <mesh ref={ref} geometry={geometry}>
      <MeshTransmissionMaterial
        color="white"
        transmission={1} // Translucidez total
        roughness={0.1} // Bordes suaves
        ior={1.5} // Índice de refracción para cristal real
        thickness={0.5} // Grosor para distorsión interna
        distortion={0.3} // Efecto de refracción curvada (gota de agua)
        chromaticAberration={0.05} // Separación de colores en bordes
        backscattering={0.01} // Reflejos internos sutiles
        attenuationColor="#ffffff"
        attenuationDistance={0.1}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}
