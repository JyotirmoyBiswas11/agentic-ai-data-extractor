import { useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../stores/authStore';
import { useAnalysisStore } from '../stores/analysisStore';
import type { AnalysisDocument } from '../types';

export function useAnalyses() {
  const { user } = useAuthStore();
  const {
    analyses,
    selectedAnalysis,
    isLoading,
    error,
    setAnalyses,
    setSelectedAnalysis,
    setIsLoading,
    setError,
  } = useAnalysisStore();

  useEffect(() => {
    if (!user) {
      setAnalyses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const analysesRef = collection(db, 'users', user.uid, 'analyses');
    const q = query(analysesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs: AnalysisDocument[] = snapshot.docs.map((item) => ({
          ...(item.data() as AnalysisDocument),
          id: item.id,
        }));
        setAnalyses(docs);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useAnalyses] Failed to fetch analyses:', err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, setAnalyses, setIsLoading, setError]);

  return {
    analyses,
    selectedAnalysis,
    isLoading,
    error,
    setSelectedAnalysis,
  };
}

export function useSingleAnalysis(analysisId?: string) {
  const { user } = useAuthStore();
  const { selectedAnalysis, setSelectedAnalysis } = useAnalysisStore();

  useEffect(() => {
    if (!user || !analysisId) return;

    const docRef = doc(db, 'users', user.uid, 'analyses', analysisId);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setSelectedAnalysis({
            ...(snapshot.data() as AnalysisDocument),
            id: snapshot.id,
          });
        }
      },
      (err) => {
        console.error(`[useSingleAnalysis] Failed to listen to ${analysisId}:`, err);
      }
    );

    return () => unsubscribe();
  }, [user, analysisId, setSelectedAnalysis]);

  return { analysis: selectedAnalysis };
}
