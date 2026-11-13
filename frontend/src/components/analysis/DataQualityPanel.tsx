import React from 'react';
import type { DataQualityReport } from '../../types';
import { ShieldCheck, AlertTriangle, CheckCircle, Copy } from 'lucide-react';

interface DataQualityPanelProps {
  report: DataQualityReport;
}

export const DataQualityPanel: React.FC<DataQualityPanelProps> = ({ report }) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 65) return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="font-heading font-semibold text-lg text-[var(--text)]">
              Data Integrity & Cleaning Report
            </h3>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            AI Automated validation of nulls, duplicates, outliers, and schema consistency
          </p>
        </div>

        {/* Overall Score Badge */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl border text-center ${getScoreColor(report.overallScore)}`}>
            <span className="font-heading font-bold text-2xl">{report.overallScore}</span>
            <span className="text-xs font-semibold ml-0.5">/100</span>
            <p className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Health Score</p>
          </div>
        </div>
      </div>

      {/* Row Metrics summary */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3.5 rounded-xl bg-[var(--secondary)]/40 border border-[var(--border)]">
          <p className="text-[11px] text-[var(--muted-foreground)]">Total Processed</p>
          <p className="font-heading font-bold text-lg text-[var(--text)]">{report.totalRows.toLocaleString()}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <p className="text-[11px] text-emerald-500 flex items-center justify-center gap-1">
            <CheckCircle className="w-3 h-3" /> Clean Rows
          </p>
          <p className="font-heading font-bold text-lg text-emerald-500">{report.cleanRows.toLocaleString()}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <p className="text-[11px] text-amber-500 flex items-center justify-center gap-1">
            <Copy className="w-3 h-3" /> Duplicate Rows
          </p>
          <p className="font-heading font-bold text-lg text-amber-500">{report.duplicateRows.toLocaleString()}</p>
        </div>
      </div>

      {/* Issues list */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Detected Anomalies ({report.issues?.length || 0})</span>
        </h4>

        {report.issues && report.issues.length > 0 ? (
          <div className="space-y-2.5">
            {report.issues.map((issue, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--primary)]">{issue.column}</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${getSeverityBadge(issue.severity)}`}>
                      {issue.severity}
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">
                      {issue.issueType.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text)]/90">{issue.description}</p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
                    {issue.affectedRows} affected rows
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Clean dataset: No critical schema anomalies or missing values detected.</span>
          </div>
        )}
      </div>
    </div>
  );
};
