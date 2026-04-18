import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardNav from '../shared/DashboardNav';

export default function EmployerLayout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', overflowX: 'hidden' }}>
      <div style={{ padding: 'clamp(1.5rem, 4%, 2.5rem) clamp(1.5rem, 4%, 2.5rem) 0' }}>
        <div className="dashboard-shell">
          <DashboardNav role="employer" />
        </div>
      </div>
      
      <Outlet />
    </div>
  );
}
