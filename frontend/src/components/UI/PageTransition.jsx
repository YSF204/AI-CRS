import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import LandingPage from '../../Pages/Public/Landing/LandingPage';
import AuthPage from '../../Pages/Public/Auth/AuthPage';

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

// Sub-component to use the useLocation hook and handle AnimatePresence routing
export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    /* mode="wait" ensures the old page fully exits before the new one enters */
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <LandingPage />
            </PageTransition>
          }
        />
        <Route
          path="/auth"
          element={
            <PageTransition>
              <AuthPage />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}
