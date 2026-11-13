import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSingleAnalysis } from '../hooks/useAnalyses';
import { formatDate, getStatusColor } from '../lib/utils';
import { KPIGrid } from '../components/analysis/KPIGrid';
import { ChartContainer } from '../components/analysis/ChartContainer';
import { DataQualityPanel } from '../components/analysis/DataQualityPanel';
import { ColumnMetaTable } from '../components/analysis/ColumnMetaTable';
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  AlertCircle,
  Download,
  Cpu,
} from 'lucide-react';

export const AnalysisDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { analysis } = useSingleAnalysis(id);

  if (!analysis) {
    return (
      <div className="py-20 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto" />
        <h3 className="font-heading font-semibold text-lg text-[var(--text)]">
          Connecting to Analysis Pipeline...
        </h3>
        <p className="text-xs text-[var(--muted-foreground)]">
          Listening for updates from Firestore pmtool database
        </p>
      </div>
    );
  }

  const exportJSON = () => {
    if (!analysis.result) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysis.result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${analysis.fileName}_extracted_value.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8">
      {/* Top Navigation & Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div className="space-y-2">
          <Link
            to="/analyses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--text)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Analyses</span>
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-[var(--text)] tracking-tight">
              {analysis.fileName}
            </h2>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize inline-flex items-center gap-1.5 ${getStatusColor(
                analysis.status
              )}`}
            >
              {(analysis.status === 'processing' || analysis.status === 'pending') && (
                <Loader2 className="w-3 h-3 animate-spin" />
              )}
              {analysis.status}
            </span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            ID: <span className="font-mono">{analysis.id}</span> • Uploaded {formatDate(analysis.createdAt)}
            {analysis.rowCount ? ` • ${analysis.rowCount.toLocaleString()} rows` : ''}
            {analysis.columnCount ? ` • ${analysis.columnCount} columns` : ''}
          </p>
        </div>

        {/* Action Buttons */}
        {analysis.status === 'complete' && analysis.result && (
          <div className="flex items-center gap-3">
            <button
              onClick={exportJSON}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] text-xs font-semibold text-[var(--text)] transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Extracted JSON</span>
            </button>
          </div>
        )}
      </div>

      {/* Processing State View */}
      {(analysis.status === 'pending' || analysis.status === 'processing') && (
        <div className="rounded-3xl border border-[var(--primary)]/30 bg-gradient-to-b from-[var(--primary)]/10 to-[var(--background)] p-8 md:p-12 text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--primary)]/20 border-t-[var(--accent)] animate-spin" />
            <Cpu className="w-8 h-8 text-[var(--primary)]" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="font-heading font-bold text-xl text-[var(--text)]">
              Agentic AI Processing in Progress
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Gemini 1.5 Flash is actively parsing data structures, scoring data health, calculating business performance metrics, and creating visualization schemas.
            </p>
          </div>

          <div className="max-w-lg mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--accent)]">Step 1</span>
              <p className="text-xs font-semibold text-[var(--text)]">Schema Scan</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--accent)]">Step 2</span>
              <p className="text-xs font-semibold text-[var(--text)]">Data Cleansing</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--accent)]">Step 3</span>
              <p className="text-xs font-semibold text-[var(--text)]">KPI Derivation</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--accent)]">Step 4</span>
              <p className="text-xs font-semibold text-[var(--text)]">Chart Synthesis</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State View */}
      {analysis.status === 'error' && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-heading font-bold text-lg text-rose-500">
              Analysis Extraction Failed
            </h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              {analysis.errorMessage || 'An unexpected error occurred while communicating with the AI Agent.'}
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90"
          >
            <span>Try Uploading Again</span>
          </Link>
        </div>
      )}

      {/* Completed State View with Full Dashboard */}
      {analysis.status === 'complete' && analysis.result && (
        <div className="space-y-8">
          {/* Executive Summary Callout */}
          {analysis.result.summary && (
            <div className="rounded-2xl border border-[var(--primary)]/30 bg-gradient-to-r from-[var(--primary)]/10 via-[var(--card)] to-[var(--accent)]/5 p-6 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-[var(--accent)]">
                <Sparkles className="w-4 h-4" />
                <span className="font-heading font-semibold text-xs tracking-wider uppercase">
                  Executive AI Summary
                </span>
              </div>
              <p className="text-sm md:text-base text-[var(--text)] font-medium leading-relaxed">
                "{analysis.result.summary}"
              </p>
            </div>
          )}

          {/* Section: Key Performance Indicators */}
          {analysis.result.kpis && analysis.result.kpis.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-lg text-[var(--text)]">
                    Extracted Value & Key Performance Indicators
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Primary metrics computed from {analysis.rowCount?.toLocaleString()} dataset rows
                  </p>
                </div>
              </div>
              <KPIGrid kpis={analysis.result.kpis} />
            </div>
          )}

          {/* Section: Interactive Visualizations */}
          {analysis.result.charts && analysis.result.charts.length > 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-[var(--text)]">
                  Dynamic Visualizations & Trends
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Interactive charts automatically mapped and aggregated by Gemini
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analysis.result.charts.map((chart) => (
                  <ChartContainer key={chart.id} chart={chart} />
                ))}
              </div>
            </div>
          )}

          {/* Section: Data Integrity & Cleaning Report */}
          {analysis.result.dataQuality && (
            <DataQualityPanel report={analysis.result.dataQuality} />
          )}

          {/* Section: Schema & Column Metadata */}
          {analysis.result.columnMetadata && analysis.result.columnMetadata.length > 0 && (
            <ColumnMetaTable columns={analysis.result.columnMetadata} />
          )}
        </div>
      )}
    </div>
  );
};
