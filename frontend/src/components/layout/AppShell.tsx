import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Loader2 } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--background)] text-[var(--text)]">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--primary)]/20 border-t-[var(--accent)] animate-spin" />
          <Loader2 className="w-6 h-6 text-[var(--primary)] absolute" />
        </div>
        <p className="mt-4 text-sm font-medium text-[var(--muted-foreground)] tracking-wide animate-pulse">
          Authenticating ...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text)] transition-colors">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col justify-between">
          <div className="max-w-7xl mx-auto w-full flex-1">
            <Outlet />
          </div>

          {/* Footer Signature */}
          <footer className="mt-12 pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--muted-foreground)]">
            <p className="font-semibold text-sm text-[var(--text)]">
              DataLens <span className="text-[var(--primary)] font-bold">by Jyotirmoy</span>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};
