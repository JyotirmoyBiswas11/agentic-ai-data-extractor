import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import {
  LayoutDashboard,
  UploadCloud,
  FileSpreadsheet,
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
      </div>
    </aside>
  );
};
