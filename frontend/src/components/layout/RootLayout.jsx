import { Outlet } from 'react-router-dom';

/**
 * RootLayout keeps the router outlet mounted consistently.
 * Each page already owns its own transition wrapper, so animating the
 * outlet itself can cause blank states during client-side navigation.
 */
export default function RootLayout() {
  return <Outlet />;
}
