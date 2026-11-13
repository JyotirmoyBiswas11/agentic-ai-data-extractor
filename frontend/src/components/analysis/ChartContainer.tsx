import React from 'react';
import type { ChartSpec } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface ChartContainerProps {
  chart: ChartSpec;
}

const PALETTE = [
  '#4F46E5', // Primary indigo
  '#06B6D4', // Accent cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#3B82F6', // Blue
];

export const ChartContainer: React.FC<ChartContainerProps> = ({ chart }) => {
  const renderChart = () => {
    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chart.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke="currentColor" />
              <XAxis
                dataKey={chart.xAxisKey}
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: 'var(--text)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              {chart.dataKeys && chart.dataKeys.length > 0 ? (
                chart.dataKeys.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={PALETTE[index % PALETTE.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))
              ) : (
                <Bar
                  dataKey={chart.yAxisKey}
                  fill={chart.color || '#4F46E5'}
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chart.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke="currentColor" />
              <XAxis
                dataKey={chart.xAxisKey}
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: 'var(--text)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              {chart.dataKeys && chart.dataKeys.length > 0 ? (
                chart.dataKeys.map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={PALETTE[index % PALETTE.length]}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                ))
              ) : (
                <Line
                  type="monotone"
                  dataKey={chart.yAxisKey}
                  stroke={chart.color || '#22D3EE'}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chart.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chart.color || '#4F46E5'} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={chart.color || '#4F46E5'} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke="currentColor" />
              <XAxis
                dataKey={chart.xAxisKey}
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: 'var(--text)',
                }}
              />
              <Area
                type="monotone"
                dataKey={chart.yAxisKey}
                stroke={chart.color || '#4F46E5'}
                fillOpacity={1}
                fill={`url(#gradient-${chart.id})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
                dataKey={chart.yAxisKey || 'value'}
                nameKey={chart.xAxisKey || 'name'}
              >
                {chart.data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: 'var(--text)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="h-64 flex items-center justify-center text-xs text-[var(--muted-foreground)]">
            Chart type not supported: {chart.type}
          </div>
        );
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex flex-col justify-between">
      <div className="mb-4">
        <h4 className="font-heading font-semibold text-base text-[var(--text)]">{chart.title}</h4>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-1">{chart.description}</p>
      </div>

      <div className="w-full flex-1 min-h-[320px]">{renderChart()}</div>
    </div>
  );
};
