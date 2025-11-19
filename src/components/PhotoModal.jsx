'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCamera, FaMapMarkerAlt, FaCalendar, FaUser, FaSearchPlus, FaSearchMinus, FaExpand } from 'react-icons/fa';
import Image from 'next/image';
import { useState, useRef } from 'react';

export default function PhotoModal({ photo, isOpen, onClose }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  if (!isOpen || !photo) return null;

  // Funciones de zoom
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 }); // Reset posición al zoom mínimo
      }
      return newZoom;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  // Zoom con rueda del ratón
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setZoomLevel(prev => Math.min(Math.max(prev + delta, 1), 3));
  };

  // Drag para mover la imagen cuando está con zoom
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="photo-modal fixed inset-0 z-[9998] flex items-center justify-center bg-black/98 backdrop-blur-xl"
        onClick={onClose}
      >
        {/* Botón cerrar - Siempre visible */}
        <button
          onClick={onClose}
          className="cursor-pointer fixed top-6 right-6 z-[9999] w-14 h-14 rounded-full bg-black/80 hover:bg-[var(--color-accent)] text-white hover:text-black transition-all duration-300 flex items-center justify-center backdrop-blur-sm border-2 border-white/10 hover:border-[var(--color-accent)] shadow-2xl"
        >
          <FaTimes size={24} />
        </button>

        {/* Controles de zoom - Siempre visibles */}
        <div className="fixed top-6 left-6 z-[9999] flex gap-2">
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
            className="cursor-pointer w-12 h-12 rounded-full bg-black/80 hover:bg-[var(--color-accent)] text-white hover:text-black transition-all duration-300 flex items-center justify-center backdrop-blur-sm border-2 border-white/10 hover:border-[var(--color-accent)] disabled:opacity-30 disabled:cursor-not-allowed shadow-xl"
            title="Aumentar zoom"
          >
            <FaSearchPlus size={18} />
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            className="cursor-pointer w-12 h-12 rounded-full bg-black/80 hover:bg-[var(--color-accent)] text-white hover:text-black transition-all duration-300 flex items-center justify-center backdrop-blur-sm border-2 border-white/10 hover:border-[var(--color-accent)] disabled:opacity-30 disabled:cursor-not-allowed shadow-xl"
            title="Reducir zoom"
          >
            <FaSearchMinus size={18} />
          </button>
          <button
            onClick={handleResetZoom}
            disabled={zoomLevel === 1}
            className="cursor-pointer w-12 h-12 rounded-full bg-black/80 hover:bg-[var(--color-accent)] text-white hover:text-black transition-all duration-300 flex items-center justify-center backdrop-blur-sm border-2 border-white/10 hover:border-[var(--color-accent)] disabled:opacity-30 disabled:cursor-not-allowed shadow-xl"
            title="Restablecer zoom"
          >
            <FaExpand size={16} />
          </button>
        </div>

        {/* Indicador de zoom */}
        {zoomLevel > 1 && (
          <div className="fixed bottom-6 left-6 z-[9999] px-4 py-2 rounded-full bg-black/80 text-white text-sm font-bold backdrop-blur-sm border-2 border-white/10 shadow-xl">
            Zoom: {Math.round(zoomLevel * 100)}%
          </div>
        )}

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full h-full max-w-[95vw] max-h-[95vh] flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-8 w-full h-full">
            
            {/* ✅ IMAGEN GRANDE - Sin bordes, con zoom */}
            <div 
              className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-black cursor-move"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ 
                cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
            >
              <motion.div
                ref={imageRef}
                animate={{
                  scale: zoomLevel,
                  x: position.x,
                  y: position.y
                }}
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
                className="relative w-full h-full"
              >
                <Image
                  src={photo.image}
                  alt={photo.title}
                  fill
                  className="object-contain"
                  priority
                  quality={100}
                  unoptimized
                  draggable={false}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </motion.div>

              {/* Hint de zoom */}
              {zoomLevel === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 text-white text-xs backdrop-blur-sm border border-white/10"
                >
                  Usa la rueda del ratón para hacer zoom
                </motion.div>
              )}
            </div>

            {/* Información - Panel lateral más compacto */}
            <div className="flex flex-col justify-center space-y-6 overflow-y-auto max-h-full p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-white/5">
              <div>
                <span className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold">
                  {photo.category}
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-white mt-2 mb-4 leading-tight">
                  {photo.title}
                </h2>
                <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                  {photo.description}
                </p>
              </div>

              {/* Metadatos */}
              <div className="space-y-4 pt-6 border-t border-gray-800">
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                    <FaUser className="text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Autor</p>
                    <p className="text-white font-semibold">{photo.author}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                    <FaCalendar className="text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Fecha</p>
                    <p className="text-white font-semibold">
                      {new Date(photo.date).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                    <FaMapMarkerAlt className="text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Ubicación</p>
                    <p className="text-white font-semibold">{photo.location}</p>
                  </div>
                </div>

                {photo.camera && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                      <FaCamera className="text-[var(--color-accent)]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Cámara</p>
                      <p className="text-white font-semibold">{photo.camera}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}