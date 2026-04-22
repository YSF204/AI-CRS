import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardNav from '../shared/DashboardNav';

export default function EmployerLayout() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--nm-bg)', 
      color: 'var(--nm-text-primary)',
      fontFamily: 'var(--font-body)',
      overflowX: 'hidden' 
    }}>
      <DashboardNav role="employer" />
      
      <main className="dashboard-shell" style={{ 
        marginLeft: 'var(--sidebar-width, 5rem)',
        minHeight: '100vh',
        transition: 'margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        padding: 'var(--spacing-8)',
        boxSizing: 'border-box'
      }}>
        <Outlet />
      </main>
    </div>
  );
}
