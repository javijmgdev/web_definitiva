'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheckCircle, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useCartStore } from '@/lib/cartStore';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CheckoutModal({ onClose }) {
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Crear pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          customer_address: formData.address,
          notes: formData.notes,
          total: getTotal(),
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Crear items del pedido
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Actualizar stock de productos
      for (const item of items) {
        const { error: stockError } = await supabase.rpc('decrement_stock', {
          product_id: item.id,
          quantity: item.quantity,
        });
        if (stockError) console.error('Error actualizando stock:', stockError);
      }

      // Éxito
      setOrderId(order.id);
      setOrderSuccess(true);
      clearCart();
      
      toast.success('¡Pedido realizado con éxito!', {
        icon: '🎉',
        duration: 5000,
      });

    } catch (error) {
      console.error('Error creando pedido:', error);
      toast.error('Error al procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
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
          className="glass-strong rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {!orderSuccess ? (
            <>
              {/* Header */}
              <div className="sticky top-0 glass-dark p-6 flex justify-between items-center border-b border-gray-800">
                <h2 className="text-2xl font-black text-white">Finalizar Pedido</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full glass-accent hover:bg-red-500 transition-colors flex items-center justify-center"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 md:p-8">
                {/* Resumen del pedido */}
                <div className="mb-6 glass rounded-xl p-4">
                  <h3 className="font-bold text-white mb-3">Resumen del Pedido</h3>
                  <div className="space-y-2 text-sm">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between text-gray-400">
                        <span>{item.quantity}x {item.name}</span>
                        <span>€{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="h-px bg-gray-800 my-2" />
                    <div className="flex justify-between text-white font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-[var(--color-accent)]">€{getTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Formulario */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <FaUser /> Nombre completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <FaEnvelope /> Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                      placeholder="juan@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <FaPhone /> Teléfono *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                      placeholder="+34 600 000 000"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <FaMapMarkerAlt /> Dirección de envío *
                    </label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
                      placeholder="Calle, número, piso, código postal, ciudad"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Notas adicionales (opcional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
                      placeholder="Instrucciones de entrega, comentarios..."
                    />
                  </div>
                </div>

                {/* Botón submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-4 bg-[var(--color-accent)] text-black font-bold text-lg rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Procesando...' : 'Confirmar Pedido'}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  * Este es un pedido demo. No se realizará ningún cargo real.
                </p>
              </form>
            </>
          ) : (
            /* Pantalla de éxito */
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                <FaCheckCircle className="text-8xl text-green-500 mx-auto mb-6" />
              </motion.div>
              
              <h2 className="text-3xl font-black text-white mb-4">
                ¡Pedido Realizado!
              </h2>
              
              <p className="text-gray-400 text-lg mb-2">
                Tu pedido ha sido procesado correctamente
              </p>
              
              <div className="glass rounded-xl p-4 mb-6 inline-block">
                <p className="text-sm text-gray-400 mb-1">Número de pedido:</p>
                <p className="text-[var(--color-accent)] font-mono font-bold text-lg">
                  #{orderId?.slice(0, 8).toUpperCase()}
                </p>
              </div>
              
              <p className="text-gray-300 mb-8">
                Recibirás un email de confirmación en <strong>{formData.email}</strong>
              </p>
              
              <button
                onClick={onClose}
                className="px-8 py-4 bg-[var(--color-accent)] text-black font-bold text-lg rounded-xl hover:bg-white transition-colors"
              >
                Continuar Comprando
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
