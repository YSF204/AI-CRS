import React from 'react';
import { PanelLeftClose, Check } from 'lucide-react';
import { ALL_SECTIONS } from '../constants';

export default function Sidebar({ sidebarOpen, setSidebarOpen, activeSections, toggleSection }) {
  return (
    <div
      className="cv-editor-sidebar"
      style={{
        width: sidebarOpen ? 224 : 52,
      }}
    >
      {/* Sidebar header */}
      <div className="flex items-center border-b-4 border-[var(--nm-ink)] flex-shrink-0 overflow-hidden"
        style={{ minHeight: 48 }}>
        {sidebarOpen && (
          <div className="px-4 flex-1 overflow-hidden">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--fg-muted)] whitespace-nowrap">CV Sections</p>
            <p className="font-['Space_Grotesk'] font-black text-xs mt-0.5 whitespace-nowrap">Click to add →</p>
          </div>
        )}
        {/* Expand / collapse toggle */}
        <button
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="flex-shrink-0 w-[52px] h-[48px] flex items-center justify-center hover:bg-[var(--bg)] transition-colors"
          style={{ borderLeft: sidebarOpen ? '2px solid var(--border-color)' : 'none' }}
        >
          <div style={{
            transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
            transform: sidebarOpen ? 'none' : 'rotate(180deg)',
          }}>
            <PanelLeftClose size={15} className="text-[var(--fg-muted)]" />
          </div>
        </button>
      </div>

      {/* Section list */}
      <div className="flex-1 overflow-y-auto py-2"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(10,10,10,0.15) transparent' }}>
        {ALL_SECTIONS.map(({ key, label, icon: Icon, accent, textColor }) => {
          const active = activeSections.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleSection(key)}
              title={sidebarOpen ? undefined : label}
              className="w-full flex items-center text-left transition-all relative"
              style={{
                gap: sidebarOpen ? 10 : 0,
                padding: sidebarOpen ? '10px 16px' : '10px 0',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                background: active ? accent : 'transparent',
                borderLeft: active && sidebarOpen ? '4px solid #0a0a0a' : '4px solid transparent',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Active dot — collapsed only */}
              {!sidebarOpen && active && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#0a0a0a]" />
              )}
              <Icon size={14} style={{ color: active ? textColor : 'var(--fg-muted)', flexShrink: 0 }} />
              {sidebarOpen && (
                <>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider flex-1 whitespace-nowrap overflow-hidden"
                    style={{ color: active ? textColor : 'var(--fg)' }}>
                    {label}
                  </span>
                  {active && (
                    <span className="w-4 h-4 flex items-center justify-center rounded-full bg-[#0a0a0a] flex-shrink-0">
                      <Check size={9} color="#fff" strokeWidth={3} />
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar footer */}
      {sidebarOpen && (
        <div className="px-4 py-2.5 border-t-2 border-[var(--border-color)] flex-shrink-0">
          <p className="font-mono text-[9px] text-[var(--fg-muted)] whitespace-nowrap">
            <span className="font-bold text-[var(--fg)]">{activeSections.length}</span> / {ALL_SECTIONS.length} active
          </p>
        </div>
      )}
    </div>
  );
}
