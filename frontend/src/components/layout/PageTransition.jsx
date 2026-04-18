import { motion } from "framer-motion";

// A reusable wrapper that defines the intro/outro animation for any page.
// Exit is intentionally instant to prevent blank-screen gaps during navigation.
export const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      transition={{ duration: 0.6, ease: "circOut" }}
    >
      {children}
    </motion.div>
  );
};
