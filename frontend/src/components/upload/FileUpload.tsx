import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { nanoid } from 'nanoid';
import { ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import { formatFileSize } from '../../lib/utils';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  Loader2,
  ArrowRight,
  X,
  Table,
} from 'lucide-react';

export const FileUpload: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = (selectedFile: File) => {
    setError(null);
    if (!selectedFile.name.endsWith('.csv') && selectedFile.type !== 'text/csv') {
      setError('Only CSV files are supported. Please upload a valid CSV file.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File exceeds the 10 MB limit.');
      return;
    }

    setFile(selectedFile);

    // Quick client-side parse for preview
    Papa.parse(selectedFile, {
      header: true,
      preview: 5,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta.fields && results.meta.fields.length > 0) {
          setHeaders(results.meta.fields);
          setPreviewRows(results.data as Record<string, string>[]);
        }
      },
      error: (err) => {
        console.warn('Preview parse error:', err);
      },
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file || !user) return;

    setIsProcessing(true);
    setError(null);
    setStatusMessage('Uploading CSV dataset to secure Cloud Storage...');

    try {
      const analysisId = `analysis_${nanoid(10)}`;
      const storagePath = `users/${user.uid}/uploads/${analysisId}.csv`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: 'text/csv',
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (uploadErr) => {
          setIsProcessing(false);
          setError(`Upload failed: ${uploadErr.message}`);
        },
        async () => {
          // Upload complete! Now trigger Express backend AI Agent
          setStatusMessage('Initiating Agentic AI analysis pipeline...');
          try {
            await api.triggerAnalysis({
              storagePath,
              analysisId,
              fileName: file.name,
            });

            setStatusMessage('Analysis queued successfully! Redirecting...');
            setTimeout(() => {
              navigate(`/analyses/${analysisId}`);
            }, 800);
          } catch (triggerErr: unknown) {
            setIsProcessing(false);
            const msg = triggerErr instanceof Error ? triggerErr.message : 'Backend error';
            setError(`Failed to trigger analysis: ${msg}`);
          }
        }
      );
    } catch (err: unknown) {
      setIsProcessing(false);
      const msg = err instanceof Error ? err.message : 'Unexpected error';
      setError(msg);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewRows([]);
    setHeaders([]);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Upload Notice</p>
            <p className="text-xs mt-0.5 opacity-90">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drop Zone */}
      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 md:p-14 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-[var(--primary)] bg-[var(--primary)]/5 scale-[1.01]'
              : 'border-[var(--border)] bg-[var(--card)]/40 hover:border-[var(--primary)]/50 hover:bg-[var(--card)]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelection(e.target.files[0]);
              }
            }}
          />
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto mb-4 border border-[var(--primary)]/20 shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-[var(--text)] mb-1">
            Upload CSV for Value Extraction
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto mb-4">
            Drag & drop your enterprise dataset here, or click to browse. Max size 10 MB.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)] text-[11px] font-medium">
            <span>Supported: Clean or Unstructured Sales, Analytics, CRM records</span>
          </div>
        </div>
      ) : (
        /* File selected & Preview card */
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center border border-[var(--primary)]/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-sm text-[var(--text)]">{file.name}</h4>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {formatFileSize(file.size)} • {headers.length} detected columns
                </p>
              </div>
            </div>

            {!isProcessing && (
              <button
                onClick={removeFile}
                className="p-2 rounded-lg hover:bg-rose-500/10 text-[var(--muted-foreground)] hover:text-rose-500 transition-colors"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick Preview Table */}
          {previewRows.length > 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]/50">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text)]">
                  <Table className="w-4 h-4 text-[var(--accent)]" />
                  <span>Previewing First 5 Rows</span>
                </div>
                <span className="text-[11px] text-[var(--muted-foreground)]">
                  Gemini will analyze full dataset rows
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--secondary)]/40 text-[var(--muted-foreground)] font-medium">
                      {headers.map((h, i) => (
                        <th key={i} className="px-4 py-2.5 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="border-b border-[var(--border)]/50 hover:bg-[var(--secondary)]/20 transition-colors"
                      >
                        {headers.map((h, cIdx) => (
                          <td key={cIdx} className="px-4 py-2 text-[var(--text)] whitespace-nowrap max-w-xs truncate">
                            {row[h] || <span className="text-slate-400 italic">null</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Upload Progress Bar if processing */}
          {isProcessing && (
            <div className="p-5 rounded-2xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-[var(--text)] flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
                  {statusMessage}
                </span>
                <span className="font-mono text-[var(--primary)] font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--border)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          {!isProcessing && (
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={removeFile}
                className="px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium hover:bg-[var(--secondary)] text-[var(--text)] transition-colors"
              >
                Choose Different File
              </button>
              <button
                type="button"
                onClick={handleUploadAndAnalyze}
                className="px-6 py-2.5 rounded-lg bg-[var(--primary)] hover:opacity-90 active:scale-[0.99] text-white font-medium text-sm flex items-center gap-2 transition-all shadow-md shadow-[var(--primary)]/20"
              >
                <span>Extract Value with AI Agent</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
