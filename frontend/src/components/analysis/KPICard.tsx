import React from 'react';
import type { KPI } from '../../types';
import { formatNumber } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  kpi: KPI;
}

export const KPICard: React.FC<KPICardProps> = ({ kpi }) => {
  const isPositive = kpi.trend === 'up';
  const isNegative = kpi.trend === 'down';

  return (
    <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40 transition-all duration-200 shadow-sm relative overflow-hidden group">
      {/* Top subtle highlight */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-[var(--muted-foreground)] tracking-wide uppercase line-clamp-1">
          {kpi.label}
        </span>
        {kpi.trend && (
          <div
            className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-500'
                : isNegative
                ? 'bg-rose-500/10 text-rose-500'
                : 'bg-slate-500/10 text-slate-400'
            }`}
          >
            {isPositive && <TrendingUp className="w-3 h-3" />}
            {isNegative && <TrendingDown className="w-3 h-3" />}
            {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
            {kpi.changePercent !== undefined && (
              <span>{kpi.changePercent > 0 ? `+${kpi.changePercent}%` : `${kpi.changePercent}%`}</span>
            )}
          </div>
        )}
      </div>

      <div className="mb-2">
        <h3 className="font-heading font-bold text-2xl md:text-3xl text-[var(--text)] tracking-tight">
          {formatNumber(kpi.value, kpi.unit)}
        </h3>
      </div>

      <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
        {kpi.description}
      </p>
    </div>
  );
};
