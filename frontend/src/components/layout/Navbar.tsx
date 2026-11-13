import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useAuth } from '../../hooks/useAuth';
import { Sun, Moon, LogOut, User, Bell, Menu } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, toggleSidebar } = useUIStore();
  const { user, profile, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--text)] transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-lg tracking-tight bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] bg-clip-text text-transparent">
            DataLens AI
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
            SaaS v1.0
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] text-[var(--text)] transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Notifications / Status */}
        <div className="relative">
          <button
            className="p-2 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--text)] transition-colors"
            title="System Active"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </div>

        {/* User Profile & Logout */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                {user.email ? user.email.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-[var(--text)] truncate max-w-[140px]">
                  {profile?.displayName || user.email?.split('@')[0]}
                </p>
                <p className="text-[10px] text-[var(--muted-foreground)] capitalize">
                  {profile?.plan || 'Free'} Plan
                </p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="p-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 text-[var(--muted-foreground)] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
