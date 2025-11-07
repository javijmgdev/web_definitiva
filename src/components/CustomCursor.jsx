'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const mouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      // Ocultar cursor si está sobre modales o formularios
      const isOverModal = e.target.closest('[role="dialog"]') || 
                          e.target.closest('.admin-panel-modal') ||
                          e.target.closest('.photo-modal');
      
      setIsHidden(!!isOverModal);

      // Detectar hover sobre elementos interactivos
      if (e.target.tagName === 'A' || 
          e.target.tagName === 'BUTTON' || 
          e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.closest('a') || 
          e.target.closest('button') ||
          e.target.closest('input') ||
          e.target.closest('textarea')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  // No renderizar si está oculto
  if (isHidden) return null;

  const variants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      scale: 1,
    },
    hover: {
      x: mousePosition.x - 32,
      y: mousePosition.y - 32,
      scale: 2,
    }
  };

  return (
    <>
      <motion.div
        className="cursor-dot"
        variants={variants}
        animate={isHovering ? "hover" : "default"}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5
        }}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '2px solid var(--color-accent)',
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 9998, // Justo debajo de los modales
          mixBlendMode: 'difference',
        }}
      />
      <motion.div
        className="cursor-outline"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.1
        }}
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-accent)',
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 9998, // Justo debajo de los modales
        }}
      />
    </>
  );
}
