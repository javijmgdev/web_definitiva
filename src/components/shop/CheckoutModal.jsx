'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaShoppingCart, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaStickyNote,
  FaCheckCircle
} from 'react-icons/fa';
import { useCartStore } from '@/lib/cartStore';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CheckoutModal({ onClose }) {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  const total = items.reduce((sum, item) => sum + item.price, 0).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: formData.address,
        notes: formData.notes,
        items: items,
        total: parseFloat(total),
        status: 'pending',
      };

      const { error } = await supabase
        .from('orders')
        .insert([orderData]);

      if (error) throw error;

      toast.success('✅ Pedido realizado con éxito');
      clearCart();
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('❌ Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    const existing = acc.find(i => i.id === item.id);
    if (existing) {
      existing.quantity++;
    } else {
      acc.push({ ...item, quantity: 1 });
    }
    return acc;
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0A0F1C] border-2 border-[var(--color-accent)] rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="bg-[#050A14] p-5 flex justify-between items-center border-b border-[var(--color-accent)]/30 flex-shrink-0">
            <div>
              <h2 className="text-2xl font-black text-white">Finalizar Pedido</h2>
              <p className="text-sm text-gray-400 mt-1">Completa tus datos para procesar el pedido</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#1A1F2E] hover:bg-red-500 transition-colors flex items-center justify-center text-white"
            >
              <FaTimes />
            </button>
          </div>

          {/* Contenido con scroll */}
          <div className="overflow-y-auto flex-1 p-6 bg-[#0A0F1C]">
            {/* Resumen del Pedido */}
            <div className="mb-6 p-5 bg-[#1A1F2E] rounded-2xl border-2 border-gray-800">
              <h3 className="text-lg font-bold text-[var(--color-accent)] mb-4 flex items-center gap-2">
                <FaShoppingCart />
                Resumen del Pedido
              </h3>
              <div className="space-y-3">
                {groupedItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-white">
                    <span className="text-gray-300">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-bold text-[var(--color-accent)]">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                <span className="text-xl font-black text-white">Total:</span>
                <span className="text-3xl font-black text-[var(--color-accent)]">
                  €{total}
                </span>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre completo */}
              <div>
                <label className="text-sm font-bold text-[var(--color-accent)] mb-2 flex items-center gap-2">
                  <FaUser />
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1A1F2E] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  placeholder="Juan Pérez"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-bold text-[var(--color-accent)] mb-2 flex items-center gap-2">
                  <FaEnvelope />
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1A1F2E] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  placeholder="juan@ejemplo.com"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="text-sm font-bold text-[var(--color-accent)] mb-2 flex items-center gap-2">
                  <FaPhone />
                  Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1A1F2E] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  placeholder="+34 600 000 000"
                />
              </div>

              {/* Dirección de envío */}
              <div>
                <label className="text-sm font-bold text-[var(--color-accent)] mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt />
                  Dirección de envío *
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#1A1F2E] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent)] resize-none transition-colors"
                  placeholder="Calle, número, piso, código postal, ciudad"
                />
              </div>

              {/* Notas adicionales */}
              <div>
                <label className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                  <FaStickyNote />
                  Notas adicionales (opcional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-[#1A1F2E] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent)] resize-none transition-colors"
                  placeholder="Instrucciones de entrega, comentarios..."
                />
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[var(--color-accent)] text-black font-black text-lg rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-accent)]/50"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="text-xl" />
                    <span>CONFIRMAR PEDIDO</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
