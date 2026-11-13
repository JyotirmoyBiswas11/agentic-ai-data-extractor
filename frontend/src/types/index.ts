export type AnalysisStatus = 'pending' | 'processing' | 'complete' | 'error';

export interface KPI {
  key: string;
  label: string;
  value: number | string;
  unit?: string;
  changePercent?: number;
  trend?: 'up' | 'down' | 'neutral';
  description: string;
}

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface ChartSpec {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  title: string;
  description: string;
  xAxisKey: string;
  yAxisKey: string;
  dataKeys: string[];
  data: ChartDataPoint[];
  color?: string;
}

export interface ColumnMeta {
  name: string;
  type: 'numeric' | 'categorical' | 'date' | 'text' | 'boolean';
  nullCount: number;
  uniqueCount: number;
  sampleValues: string[];
}

export interface DataQualityIssue {
  column: string;
  issueType: 'missing_values' | 'outliers' | 'format_mismatch' | 'duplicates';
  severity: 'low' | 'medium' | 'high';
  affectedRows: number;
  description: string;
}

export interface DataQualityReport {
  overallScore: number;
  totalRows: number;
  cleanRows: number;
  duplicateRows: number;
  issues: DataQualityIssue[];
}

export interface AnalysisResult {
  kpis: KPI[];
  charts: ChartSpec[];
  dataQuality: DataQualityReport;
  columnMetadata: ColumnMeta[];
  summary: string;
}

export interface AnalysisDocument {
  id: string;
  uid: string;
  userId?: string;
  fileName: string;
  storagePath: string;
  status: AnalysisStatus;
  errorMessage?: string;
  rowCount: number;
  columnCount: number;
  createdAt: { seconds: number; nanoseconds: number } | Date | null;
  updatedAt: { seconds: number; nanoseconds: number } | Date | null;
  result?: AnalysisResult;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  createdAt: { seconds: number; nanoseconds: number } | null;
  lastLoginAt?: { seconds: number; nanoseconds: number } | null;
  plan: 'free' | 'pro' | 'enterprise';
}
