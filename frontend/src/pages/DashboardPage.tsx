import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAnalyses } from '../hooks/useAnalyses';
import { formatDate, getStatusColor } from '../lib/utils';
import { KPIGrid } from '../components/analysis/KPIGrid';
import {
  UploadCloud,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Clock,
  Layers,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { analyses, isLoading } = useAnalyses();

  const completedAnalyses = analyses.filter((a) => a.status === 'complete');
  const latestCompleted = completedAnalyses[0];

  const totalRowsProcessed = analyses.reduce((acc, curr) => acc + (curr.rowCount || 0), 0);
  const averageQuality = completedAnalyses.length
    ? Math.round(
        completedAnalyses.reduce(
          (acc, curr) => acc + (curr.result?.dataQuality.overallScore || 0),
          0
        ) / completedAnalyses.length
      )
    : 0;

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="rounded-3xl border border-[var(--border)] bg-gradient-to-r from-[var(--primary)]/10 via-[var(--accent)]/5 to-[var(--background)] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Value Extractor Ready</span>
          </div>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[var(--text)] tracking-tight">
            Welcome back, {profile?.displayName || user?.email?.split('@')[0]}
          </h2>
          <p className="text-xs md:text-sm text-[var(--muted-foreground)] leading-relaxed">
            Upload raw business files and monitor real-time AI column extraction, data anomaly cleansing, and executive KPI generation.
          </p>
        </div>

        <div className="z-10 shrink-0">
          <Link
            to="/upload"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[var(--primary)] hover:opacity-90 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-lg shadow-[var(--primary)]/25"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Dataset</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span>Total Datasets</span>
            <FileSpreadsheet className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <p className="font-heading font-bold text-2xl text-[var(--text)]">{analyses.length}</p>
          <p className="text-[11px] text-[var(--muted-foreground)]">Processed through pipeline</p>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span>Rows Analyzed</span>
            <Layers className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="font-heading font-bold text-2xl text-[var(--text)]">
            {totalRowsProcessed.toLocaleString()}
          </p>
          <p className="text-[11px] text-[var(--muted-foreground)]">Across all files</p>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span>Completed Analyses</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-heading font-bold text-2xl text-emerald-500">
            {completedAnalyses.length}
          </p>
          <p className="text-[11px] text-[var(--muted-foreground)]">Ready to view</p>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span>Avg Data Quality</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-heading font-bold text-2xl text-[var(--text)]">
            {averageQuality ? `${averageQuality}/100` : 'N/A'}
          </p>
          <p className="text-[11px] text-[var(--muted-foreground)]">Integrity score</p>
        </div>
      </div>

      {/* Latest Extracted KPIs Banner (if exists) */}
      {latestCompleted?.result?.kpis && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-semibold text-lg text-[var(--text)]">
                Latest Value Extraction
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                From {latestCompleted.fileName}
              </p>
            </div>
            <Link
              to={`/analyses/${latestCompleted.id}`}
              className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              <span>View Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <KPIGrid kpis={latestCompleted.result.kpis.slice(0, 4)} />
        </div>
      )}

      {/* Recent Datasets List */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="font-heading font-semibold text-base text-[var(--text)]">
              Recent Datasets
            </h3>
          </div>
          <Link
            to="/analyses"
            className="text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--text)] transition-colors"
          >
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-[var(--muted-foreground)] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
            <span>Fetching analyses from pmtool...</span>
          </div>
        ) : analyses.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--secondary)] flex items-center justify-center mx-auto text-[var(--muted-foreground)]">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="font-heading font-semibold text-sm text-[var(--text)]">
              No datasets uploaded yet
            </h4>
            <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
              Upload your first business CSV file to trigger the Agentic AI data extraction pipeline.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Your First Dataset</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {analyses.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                to={`/analyses/${item.id}`}
                className="p-4 flex items-center justify-between hover:bg-[var(--secondary)]/20 transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[var(--secondary)] flex items-center justify-center text-[var(--text)] group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)] transition-colors">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-heading font-semibold text-sm text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                      {item.fileName}
                    </h5>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      {item.rowCount ? `${item.rowCount.toLocaleString()} rows • ` : ''}
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:translate-x-1 group-hover:text-[var(--text)] transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
