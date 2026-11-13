import { create } from 'zustand';
import type { AnalysisDocument } from '../types';

interface AnalysisState {
  analyses: AnalysisDocument[];
  selectedAnalysis: AnalysisDocument | null;
  isLoading: boolean;
  error: string | null;
  setAnalyses: (analyses: AnalysisDocument[]) => void;
  setSelectedAnalysis: (analysis: AnalysisDocument | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  analyses: [],
  selectedAnalysis: null,
  isLoading: false,
  error: null,
  setAnalyses: (analyses) => set({ analyses }),
  setSelectedAnalysis: (selectedAnalysis) => set({ selectedAnalysis }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
