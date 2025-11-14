'use client';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

export function OptimizedMotionDiv({ children, ...props }) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      {...props}
      transition={{
        ...props.transition,
        type: shouldReduceMotion ? 'tween' : props.transition?.type || 'spring',
        ease: shouldReduceMotion ? 'linear' : props.transition?.ease || 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}
