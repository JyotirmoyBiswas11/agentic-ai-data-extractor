import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAnalyses } from '../hooks/useAnalyses';
import { formatDate, getStatusColor } from '../lib/utils';
import {
  FileSpreadsheet,
  Search,
  Filter,
  ArrowRight,
  UploadCloud,
  Loader2,
} from 'lucide-react';

export const AnalysesListPage: React.FC = () => {
  const { analyses, isLoading } = useAnalyses();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAnalyses = analyses.filter((item) => {
    const matchesSearch = item.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-2xl text-[var(--text)] tracking-tight">
            Analyses History
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            All datasets processed by your workspace's AI pipeline
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition-all shadow-md shadow-[var(--primary)]/20 shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Dataset</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by file name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-[var(--background)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs bg-[var(--background)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors capitalize"
          >
            <option value="all">All Statuses</option>
            <option value="complete">Complete</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Table container */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-16 text-center text-xs text-[var(--muted-foreground)] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
            <span>Loading analyses from pmtool database...</span>
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--secondary)] flex items-center justify-center mx-auto text-[var(--muted-foreground)]">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="font-heading font-semibold text-sm text-[var(--text)]">
              No analyses match your criteria
            </h4>
            <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'Upload a CSV file to generate your first data value extraction report.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--secondary)]/30 text-[var(--muted-foreground)] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3.5">Dataset Name</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Rows</th>
                  <th className="px-5 py-3.5 text-right">Columns</th>
                  <th className="px-5 py-3.5 text-right">Quality Score</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredAnalyses.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--secondary)]/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--secondary)] flex items-center justify-center text-[var(--text)]">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-heading font-semibold text-xs text-[var(--text)]">
                            {item.fileName}
                          </p>
                          <p className="text-[10px] font-mono text-[var(--muted-foreground)]">
                            {item.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize inline-block ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-[var(--text)]">
                      {item.rowCount?.toLocaleString() || '—'}
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-[var(--text)]">
                      {item.columnCount || '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {item.result?.dataQuality ? (
                        <span className="font-heading font-bold text-xs text-[var(--accent)]">
                          {item.result.dataQuality.overallScore}/100
                        </span>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[var(--muted-foreground)] whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/analyses/${item.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--secondary)] hover:border-[var(--primary)]/40 text-xs font-semibold text-[var(--text)] transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
