import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search, PlusCircle, LogOut } from 'lucide-react';

export default function EmployerDash() {
  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Building2 size={40} className="text-(--coral)" />
            EMPLOYER CENTER
          </h1>
          <Link to="/" className="brutal-btn-outline px-6 py-2 flex items-center gap-2">
            <LogOut size={18} />
            EXIT
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="brutal-card p-6 bg-(--card-bg)">
            <PlusCircle size={32} className="mb-4 text-(--yellow)" />
            <h2 className="text-2xl mb-2">POST JOB</h2>
            <p className="text-(--fg-muted) font-mono mb-6">Create a new opportunity.</p>
            <button className="brutal-btn px-4 py-3 bg-(--yellow) w-full font-bold">START POSTING</button>
          </div>

          <div className="brutal-card p-6 bg-(--card-bg)">
            <Search size={32} className="mb-4 text-(--blue)" />
            <h2 className="text-2xl mb-2">FIND TALENT</h2>
            <p className="text-(--fg-muted) font-mono mb-6">Search through analyzed CVs.</p>
            <button className="brutal-btn px-4 py-3 bg-(--teal) w-full font-bold">SEARCH</button>
          </div>

          <div className="brutal-card p-6 bg-(--card-bg) border-dashed border-4 border-black border-opacity-20 shadow-none hover:shadow-none hover:translate-0">
             <div className="h-full flex flex-col justify-center items-center text-center opacity-40">
                <PlusCircle size={48} className="mb-2" />
                <span className="font-mono font-bold">ADD WIDGET</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
