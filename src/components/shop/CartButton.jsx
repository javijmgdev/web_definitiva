'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';
import { useCartStore } from '@/lib/cartStore';

export default function CartButton() {
  const itemCount = useCartStore((state) => state.getItemCount());
  const toggleCart = useCartStore((state) => state.toggleCart);

  return (
    <motion.button
      onClick={toggleCart}
      className="fixed bottom-8 right-8 z-40 w-16 h-16 rounded-full bg-[var(--color-accent)] text-black flex items-center justify-center shadow-2xl shadow-[var(--color-accent)]/50 hover:scale-110 transition-transform"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <FaShoppingCart className="text-2xl" />
      
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border-2 border-black"
          >
            {itemCount}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
