import React from 'react';
import { User, Briefcase, FileText } from 'lucide-react';
import DashboardNav from '../../components/UI/DashboardNav';

export default function EmployeeDash() {
  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="max-w-6xl mx-auto">
        
        <DashboardNav role="employee" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="brutal-card p-6 bg-(--card-bg) col-span-1 lg:col-span-2 flex flex-col justify-center">
            <h2 className="text-3xl mb-2 font-['Space_Grotesk'] font-bold uppercase tracking-tight">WELCOME BACK</h2>
            <p className="font-mono mb-6 text-(--fg-muted)">You have 3 new job matches today.</p>
            <button className="brutal-btn px-8 py-3 bg-(--yellow) font-bold self-start">VIEW MATCHES</button>
          </div>

          <div className="brutal-card p-6 bg-(--card-bg)">
            <FileText size={32} className="mb-4 text-(--coral)" />
            <h2 className="font-bold mb-1 font-['Space_Grotesk'] text-xl uppercase tracking-tight">MY CVs</h2>
            <p className="text-sm font-mono opacity-70 mb-4 text-(--fg-muted)">Update your profile.</p>
            <button className="brutal-btn px-4 py-2 bg-(--mint) w-full font-bold">EDIT</button>
          </div>

          <div className="brutal-card p-6 bg-(--card-bg)">
            <Briefcase size={32} className="mb-4 text-(--blue)" />
            <h2 className="font-bold mb-1 font-['Space_Grotesk'] text-xl uppercase tracking-tight">APPS</h2>
            <p className="text-sm font-mono opacity-70 mb-4 text-(--fg-muted)">Track status.</p>
            <button className="brutal-btn px-4 py-2 bg-(--teal) w-full font-bold">TRACK</button>
          </div>
        </div>
      </div>
    </div>
  );
}
