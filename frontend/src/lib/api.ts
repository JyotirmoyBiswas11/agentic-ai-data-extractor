import { auth } from './firebase';
import { getLimitedAppCheckToken } from './appcheck';
import type { AnalysisDocument } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface TriggerAnalysisRequest {
  storagePath: string;
  analysisId: string;
  fileName: string;
}

export interface TriggerAnalysisResponse {
  analysisId: string;
  status: string;
  message: string;
}

async function getAuthorizedHeaders(): Promise<Record<string, string>> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be signed in to perform this operation.');
  }

  const [idToken, appCheckToken] = await Promise.all([
    currentUser.getIdToken(),
    getLimitedAppCheckToken(),
  ]);

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${idToken}`,
    'X-Firebase-AppCheck': appCheckToken,
  };
}

export const api = {
  async triggerAnalysis(payload: TriggerAnalysisRequest): Promise<TriggerAnalysisResponse> {
    const headers = await getAuthorizedHeaders();
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    return response.json();
  },

  async getAnalysis(analysisId: string): Promise<AnalysisDocument> {
    const headers = await getAuthorizedHeaders();
    const response = await fetch(`${API_BASE_URL}/api/analyses/${analysisId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch analysis' }));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    return response.json();
  },

  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }
    return response.json();
  },
};
