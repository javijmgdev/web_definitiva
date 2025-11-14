'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaShoppingCart, FaMinus, FaPlus } from 'react-icons/fa';
import { useCartStore } from '@/lib/cartStore';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ProductModal({ product, onClose }) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast.success(`${quantity} x ${product.name} añadido al carrito`);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 glass-dark p-6 flex justify-between items-center border-b border-gray-800">
            <h2 className="text-2xl font-black text-white">Detalles del Producto</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full glass-accent hover:bg-red-500 transition-colors flex items-center justify-center"
            >
              <FaTimes />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Imagen */}
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-900">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex flex-col">
                <span className="text-sm text-[var(--color-accent)] font-semibold uppercase tracking-wider mb-2">
                  {product.category}
                </span>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                  {product.name}
                </h3>
                <p className="text-gray-300 text-lg mb-6">
                  {product.description}
                </p>

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-5xl font-black text-[var(--color-accent)]">
                    €{product.price.toFixed(2)}
                  </span>
                  <span className="text-gray-500">/ unidad</span>
                </div>

                {/* Stock */}
                <div className="mb-6 p-4 glass rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Stock disponible:</span>
                    <span className={`font-bold ${product.stock < 10 ? 'text-orange-500' : 'text-green-500'}`}>
                      {product.stock} unidades
                    </span>
                  </div>
                </div>

                {/* Cantidad */}
                <div className="mb-6">
                  <label className="text-sm text-gray-400 mb-2 block">Cantidad:</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full glass-accent hover:bg-[var(--color-accent)] hover:text-black transition-all"
                    >
                      <FaMinus className="mx-auto" />
                    </button>
                    <span className="text-3xl font-bold text-white w-16 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="w-10 h-10 rounded-full glass-accent hover:bg-[var(--color-accent)] hover:text-black transition-all disabled:opacity-50"
                    >
                      <FaPlus className="mx-auto" />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="mb-6 p-4 glass-accent rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-lg text-white">Subtotal:</span>
                    <span className="text-3xl font-black text-[var(--color-accent)]">
                      €{(product.price * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Botón añadir */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full py-4 bg-[var(--color-accent)] text-black font-bold text-lg rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaShoppingCart className="text-xl" />
                  <span>Añadir al Carrito</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
