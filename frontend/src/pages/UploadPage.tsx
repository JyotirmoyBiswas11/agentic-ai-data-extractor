import React from 'react';
import { FileUpload } from '../components/upload/FileUpload';
import { Sparkles } from 'lucide-react';

export const UploadPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase font-semibold tracking-wider text-[var(--accent)]">
            Pipeline Ingestion
          </span>
        </div>
        <h2 className="font-heading font-bold text-2xl md:text-3xl text-[var(--text)] tracking-tight">
          Upload Dataset for Agentic Extraction
        </h2>
        <p className="text-xs md:text-sm text-[var(--muted-foreground)] mt-1 max-w-2xl">
          Feed raw, unstructured CSV records into our Gemini-powered processing pipeline. The backend AI Agent automatically cleans schemas, resolves anomalies, extracts business KPIs, and generates visualization charts.
        </p>
      </div>

      {/* Upload Component */}
      <FileUpload />

      {/* How It Works Section */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
        <h4 className="font-heading font-semibold text-sm text-[var(--text)] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--primary)]" />
          <span>The Agentic AI Extraction Pipeline</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[var(--secondary)]/30 border border-[var(--border)] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold text-xs font-mono">
              01
            </div>
            <h5 className="font-heading font-semibold text-xs text-[var(--text)]">Schema Detection</h5>
            <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
              Analyzes headers and sample values to categorize columns into numeric, date, category, or text.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--secondary)]/30 border border-[var(--border)] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold text-xs font-mono">
              02
            </div>
            <h5 className="font-heading font-semibold text-xs text-[var(--text)]">Anomaly Cleansing</h5>
            <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
              Detects null values, format inconsistencies, and duplicate records; computes data health score.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--secondary)]/30 border border-[var(--border)] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs font-mono">
              03
            </div>
            <h5 className="font-heading font-semibold text-xs text-[var(--text)]">KPI Derivation</h5>
            <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
              Computes revenue totals, averages, growth metrics, conversion rates, and top-tier performers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--secondary)]/30 border border-[var(--border)] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xs font-mono">
              04
            </div>
            <h5 className="font-heading font-semibold text-xs text-[var(--text)]">Visual Intelligence</h5>
            <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
              Recommends bar, line, and pie chart layouts with shaped data ready for interactive rendering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
