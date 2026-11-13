import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import {
  LayoutDashboard,
  UploadCloud,
  FileSpreadsheet,
  ShieldCheck,
  Database,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { sidebarOpen } = useUIStore();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Upload & Extract', path: '/upload', icon: UploadCloud },
    { name: 'Analyses History', path: '/analyses', icon: FileSpreadsheet },
  ];

  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 border-r border-[var(--border)] bg-[var(--card)]/50 flex flex-col justify-between shrink-0 transition-all duration-300">
      <div className="p-4 space-y-6">
        {/* Navigation Items */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
            Workspace
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--primary)] text-white shadow-sm font-semibold'
                      : 'text-[var(--text)]/80 hover:bg-[var(--secondary)] hover:text-[var(--text)]'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Feature Highlight Card */}
        <div className="p-3.5 rounded-xl border border-[var(--primary)]/20 bg-gradient-to-b from-[var(--primary)]/5 to-transparent relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1.5 text-[var(--accent)] font-medium text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agentic Engine</span>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
            Gemini multi-stage pipeline auto-detects column schemas, cleans anomalies, and generates KPIs.
          </p>
        </div>
      </div>

      {/* System Status Footprint */}
      <div className="p-4 border-t border-[var(--border)] space-y-2">
        <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>App Check</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
            Enforced
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-500" />
            <span>Firestore DB</span>
          </div>
          <span className="font-mono text-[10px] text-cyan-500 font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded">
            pmtool
          </span>
        </div>
      </div>
    </aside>
  );
};
