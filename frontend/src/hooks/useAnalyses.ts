import { useEffect } from 'react';
import {
  collection,
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

    // Safeguard timeout: ensure UI stops spinning even if Firestore network takes long
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3500);

    const analysesRef = collection(db, 'users', user.uid, 'analyses');

    const unsubscribe = onSnapshot(
      analysesRef,
      (snapshot) => {
        clearTimeout(timeout);
        const docs: AnalysisDocument[] = snapshot.docs.map((item) => ({
          ...(item.data() as AnalysisDocument),
          id: item.id,
        }));

        // Sort latest first in memory (avoids composite index requirement)
        docs.sort((a, b) => {
          const rawA = a.createdAt as unknown as { toMillis?: () => number; seconds?: number } | undefined;
          const rawB = b.createdAt as unknown as { toMillis?: () => number; seconds?: number } | undefined;
          const timeA = rawA?.toMillis?.() ?? (rawA?.seconds ? rawA.seconds * 1000 : 0);
          const timeB = rawB?.toMillis?.() ?? (rawB?.seconds ? rawB.seconds * 1000 : 0);
          return timeB - timeA;
        });

        setAnalyses(docs);
        setIsLoading(false);
      },
      (err) => {
        clearTimeout(timeout);
        console.error('[useAnalyses] Failed to fetch analyses:', err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
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
