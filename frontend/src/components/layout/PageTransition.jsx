import { motion } from 'motion/react';

// A reusable wrapper that defines the intro/outro animation for any page
export const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4, ease: 'circOut' }}
    >
      {children}
    </motion.div>
  );
};
