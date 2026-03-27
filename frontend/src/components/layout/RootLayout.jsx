import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';

/**
 * RootLayout — wraps the entire app with AnimatePresence so that
 * PageTransition exit animations play correctly when navigating.
 * Used as the root layout element in createBrowserRouter.
 */
export default function RootLayout() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Outlet key={location.key} />
    </AnimatePresence>
  );
}
