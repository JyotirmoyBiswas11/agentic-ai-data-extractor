import React from 'react';
import type { ColumnMeta } from '../../types';
import { Columns, Hash, Tag, Calendar, FileText, ToggleLeft } from 'lucide-react';

interface ColumnMetaTableProps {
  columns: ColumnMeta[];
}

export const ColumnMetaTable: React.FC<ColumnMetaTableProps> = ({ columns }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'numeric':
        return <Hash className="w-3.5 h-3.5 text-cyan-500" />;
      case 'categorical':
        return <Tag className="w-3.5 h-3.5 text-purple-500" />;
      case 'date':
        return <Calendar className="w-3.5 h-3.5 text-amber-500" />;
      case 'boolean':
        return <ToggleLeft className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]/50">
        <div className="flex items-center gap-2">
          <Columns className="w-4 h-4 text-[var(--primary)]" />
          <h4 className="font-heading font-semibold text-sm text-[var(--text)]">
            Extracted Column Schema ({columns.length})
          </h4>
        </div>
        <span className="text-[11px] text-[var(--muted-foreground)]">
          Inferred by Gemini AI Model
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--secondary)]/30 text-[var(--muted-foreground)] font-semibold uppercase tracking-wider text-[10px]">
              <th className="px-4 py-3">Column Name</th>
              <th className="px-4 py-3">Inferred Type</th>
              <th className="px-4 py-3 text-right">Null Count</th>
              <th className="px-4 py-3 text-right">Unique Values</th>
              <th className="px-4 py-3">Sample Values</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {columns.map((col, index) => (
              <tr key={index} className="hover:bg-[var(--secondary)]/15 transition-colors">
                <td className="px-4 py-3 font-mono font-medium text-[var(--text)]">
                  {col.name}
                </td>
                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--text)] font-medium capitalize text-[11px]">
                    {getTypeIcon(col.type)}
                    <span>{col.type}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono text-[var(--muted-foreground)]">
                  {col.nullCount}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[var(--muted-foreground)]">
                  {col.uniqueCount}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-md">
                    {col.sampleValues?.map((sample, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[10px] text-[var(--text)]/80 font-mono truncate max-w-[120px]"
                      >
                        {sample}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
