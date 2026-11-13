import React from 'react';
import type { KPI } from '../../types';
import { KPICard } from './KPICard';

interface KPIGridProps {
  kpis: KPI[];
}

export const KPIGrid: React.FC<KPIGridProps> = ({ kpis }) => {
  if (!kpis || kpis.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <KPICard key={kpi.key || index} kpi={kpi} />
      ))}
    </div>
  );
};
