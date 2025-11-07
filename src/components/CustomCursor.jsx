'use client';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const requestRef = useRef();

  useEffect(() => {
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const handleMouseOver = (e) => {
      // Buscar el elemento interactivo más cercano
      const interactiveElement = e.target.closest('a, button, input, textarea, select, [role="button"]');
      
      setIsHovering(!!interactiveElement);
    };

    const animate = () => {
      // Smooth lerp (interpolación lineal) para suavizar el movimiento
      const lerp = 0.15;
      currentX += (targetX - currentX) * lerp;
      currentY += (targetY - currentY) * lerp;

      setMousePosition({ x: currentX, y: currentY });
      requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Círculo grande exterior */}
      <motion.div
        className="cursor-dot"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0.8 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.1
        }}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '2px solid var(--color-accent)',
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 99999,
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
      
      {/* Punto interior */}
      <motion.div
        className="cursor-outline"
        style={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-accent)',
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
        }}
      />
    </>
  );
}
