import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Outlet renders child routes - they handle their own padding via dashboard-shell */}
      <Outlet />
    </div>
  );
}