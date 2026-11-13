import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { Sparkles, ShieldCheck, Cpu } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen w-full flex bg-[var(--background)] text-[var(--text)] transition-colors">
      {/* Left Hero Column (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between border-r border-[var(--border)] bg-gradient-to-br from-[var(--background)] via-[var(--secondary)]/20 to-[var(--background)] relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white shadow-md shadow-[var(--primary)]/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-xl tracking-tight text-[var(--text)]">
              DataLens AI
            </h1>
            <p className="text-[11px] text-[var(--muted-foreground)] tracking-wide uppercase font-medium">
              Agentic Data Value Extractor
            </p>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="space-y-6 max-w-lg relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>Multi-Agent Gemini 1.5 Pipeline</span>
          </div>

          <h2 className="font-heading font-bold text-3xl xl:text-4xl leading-tight text-[var(--text)]">
            Turn Raw Business Data Into Structured Decision Intelligence.
          </h2>

          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            Upload unstructured sales logs, CRM exports, or analytics spreadsheets. Our Express & Gemini AI engine cleans anomalies, extracts performance KPIs, and builds dynamic visual dashboards instantly.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/60">
              <p className="font-heading font-bold text-lg text-[var(--text)]">4-Stage</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Sequential AI Agent Analysis</p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/60">
              <p className="font-heading font-bold text-lg text-emerald-500">100% Secure</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">App Check & JWT Protected</p>
            </div>
          </div>
        </div>

        {/* Footer badges */}
        <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)] relative z-10">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>reCAPTCHA v3 Enforced</span>
          </div>
          <span>•</span>
          <span>Google Cloud Run Ready</span>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-lg">DataLens AI</span>
            </div>
            <h2 className="font-heading font-bold text-2xl text-[var(--text)]">
              {mode === 'login' ? 'Welcome back' : 'Create your workspace'}
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {mode === 'login'
                ? 'Sign in to access your data value extractions & dashboards'
                : 'Start analyzing unstructured enterprise datasets in seconds'}
            </p>
          </div>

          <div className="p-6 md:p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-lg shadow-black/5">
            {mode === 'login' ? (
              <LoginForm
                onSuccess={() => navigate('/')}
                onSwitchToRegister={() => setMode('register')}
              />
            ) : (
              <RegisterForm
                onSuccess={() => navigate('/')}
                onSwitchToLogin={() => setMode('login')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
