import React from 'react';
import { Users, Settings } from 'lucide-react';
import DashboardNav from '../../components/shared/DashboardNav';

export default function AdminDash() {
  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="max-w-6xl mx-auto">
        
        <DashboardNav role="admin" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="brutal-card p-6 bg-(--card-bg)">
            <Users size={32} className="mb-4 text-(--coral)" />
            <h2 className="text-2xl mb-2">MANAGE USERS</h2>
            <p className="text-(--fg-muted) font-mono mb-4">View and edit user permissions.</p>
            <button className="brutal-btn px-4 py-2 bg-(--yellow) w-full">OPEN</button>
          </div>

          <div className="brutal-card p-6 bg-(--card-bg)">
            <Settings size={32} className="mb-4 text-(--teal)" />
            <h2 className="text-2xl mb-2">SYSTEM SETTINGS</h2>
            <p className="text-(--fg-muted) font-mono mb-4">Configure global parameters.</p>
            <button className="brutal-btn px-4 py-2 bg-(--mint) w-full">CONFIG</button>
          </div>

          <div className="brutal-card p-6 brutal-card-yellow">
            <h2 className="text-2xl mb-2">SYSTEM STATUS</h2>
            <div className="space-y-2 mt-4 font-mono text-sm">
              <div className="flex justify-between border-b-2 border-black pb-1">
                <span>CPU:</span> <span>42%</span>
              </div>
              <div className="flex justify-between border-b-2 border-black pb-1">
                <span>RAM:</span> <span>2.4 GB</span>
              </div>
              <div className="flex justify-between">
                <span>UPTIME:</span> <span>99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
