import React from 'react';
import { Link } from 'react-router-dom';
import { User, Briefcase, FileText, LogOut } from 'lucide-react';

export default function EmployeeDash() {
  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <User size={40} className="text-(--teal)" />
            EMPLOYEE PORTAL
          </h1>
          <Link to="/" className="brutal-btn-outline px-6 py-2 flex items-center gap-2">
            <LogOut size={18} />
            BACK
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="brutal-card p-6 bg-(--card-bg) col-span-1 lg:col-span-2">
            <h2 className="text-3xl mb-4">WELCOME BACK</h2>
            <p className="font-mono mb-6">You have 3 new job matches today.</p>
            <button className="brutal-btn px-8 py-3 bg-(--yellow)">VIEW MATCHES</button>
          </div>

          <div className="brutal-card p-6 bg-(--card-bg)">
            <FileText size={32} className="mb-4 text-(--coral)" />
            <h2 className="font-bold mb-1">MY CVs</h2>
            <p className="text-sm font-mono opacity-70 mb-4">Update your profile.</p>
            <button className="brutal-btn px-4 py-2 bg-(--mint) w-full">EDIT</button>
          </div>

          <div className="brutal-card p-6 bg-(--card-bg)">
            <Briefcase size={32} className="mb-4 text-(--blue)" />
            <h2 className="font-bold mb-1">APPLICATIONS</h2>
            <p className="text-sm font-mono opacity-70 mb-4">Track status.</p>
            <button className="brutal-btn px-4 py-2 bg-(--teal) w-full">TRACK</button>
          </div>
        </div>
      </div>
    </div>
  );
}
