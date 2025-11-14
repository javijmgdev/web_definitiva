'use client';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaEye } from 'react-icons/fa';
import { useCartStore } from '@/lib/cartStore';
import toast from 'react-hot-toast';
import { useState } from 'react';
import ProductModal from './ProductModal';

export default function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [showModal, setShowModal] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} añadido al carrito`, {
      icon: '🛒',
      style: {
        background: '#1a1a1a',
        color: '#fff',
        border: '1px solid #b7ff00',
      },
    });
  };

  return (
    <>
      <motion.div
        className="group relative glass rounded-2xl overflow-hidden cursor-pointer"
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        onClick={() => setShowModal(true)}
      >
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden bg-gray-900">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Overlay con botones */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
              className="w-12 h-12 rounded-full glass-accent flex items-center justify-center hover:scale-110 transition-transform"
            >
              <FaEye className="text-xl" />
            </button>
            <button
              onClick={handleAddToCart}
              className="w-12 h-12 rounded-full bg-[var(--color-accent)] text-black flex items-center justify-center hover:scale-110 transition-transform"
            >
              <FaShoppingCart className="text-xl" />
            </button>
          </div>

          {/* Badge de stock bajo */}
          {product.stock < 10 && product.stock > 0 && (
            <div className="absolute top-3 right-3 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
              ¡Últimas {product.stock} unidades!
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              Agotado
            </div>
          )}
        </div>

        {/* Info del producto */}
        <div className="p-4 md:p-6">
          <span className="text-xs text-[var(--color-accent)] font-semibold uppercase tracking-wider">
            {product.category}
          </span>
          <h3 className="text-lg md:text-xl font-bold text-white mt-2 mb-1 line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl md:text-3xl font-black text-[var(--color-accent)]">
              €{product.price.toFixed(2)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="px-4 py-2 bg-[var(--color-accent)] text-black font-bold rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Añadir
            </button>
          </div>
        </div>

        {/* Borde animado */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--color-accent)] transition-all duration-300 rounded-2xl pointer-events-none" />
      </motion.div>

      {/* Modal de detalles */}
      {showModal && (
        <ProductModal 
          product={product} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
}
