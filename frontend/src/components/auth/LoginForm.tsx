import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, ArrowRight, AlertCircle, KeyRound, Mail } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in. Please check your credentials.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Work Email</label>
        <div className="relative">
          <Mail className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            placeholder="you@company.com"
            {...register('email')}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-[var(--background)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-[11px] text-rose-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Password</label>
        <div className="relative">
          <KeyRound className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-[var(--background)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
          />
        </div>
        {errors.password && (
          <p className="mt-1 text-[11px] text-rose-500">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 rounded-lg bg-[var(--primary)] hover:opacity-90 active:scale-[0.99] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[var(--primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying Credentials...</span>
          </>
        ) : (
          <>
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {onSwitchToRegister && (
        <div className="text-center pt-2">
          <p className="text-xs text-[var(--muted-foreground)]">
            Don't have an enterprise account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-semibold text-[var(--accent)] hover:underline"
            >
              Register here
            </button>
          </p>
        </div>
      )}
    </form>
  );
};
