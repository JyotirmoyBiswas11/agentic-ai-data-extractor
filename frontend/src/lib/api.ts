import { auth } from './firebase';
import type { AnalysisDocument } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface UploadAnalysisResponse {
  analysisId: string;
  status: string;
  message: string;
}

/**
 * Returns headers with the Firebase Auth ID token.
 * App Check is NOT used — the backend App Check middleware is a passthrough.
 * Do NOT set Content-Type here; multipart uploads need the browser to set it
 * automatically (with the boundary) for FormData requests.
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be signed in to perform this operation.');
  }
  const idToken = await currentUser.getIdToken();
  return {
    Authorization: `Bearer ${idToken}`,
  };
}

export const api = {
  /**
   * Uploads a CSV file directly to the Express backend as multipart/form-data.
   * The backend parses it in-memory and runs the Gemini AI pipeline.
   * No Firebase Storage is involved.
   */
  async uploadAndAnalyze(file: File): Promise<UploadAnalysisResponse> {
    const headers = await getAuthHeaders();

    const formData = new FormData();
    formData.append('file', file, file.name);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers, // No Content-Type — browser sets multipart boundary automatically
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    return response.json() as Promise<UploadAnalysisResponse>;
  },

  async getAnalysis(analysisId: string): Promise<AnalysisDocument> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/analyses/${analysisId}`, {
      method: 'GET',
      headers: { ...headers, 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch analysis' }));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    return response.json() as Promise<AnalysisDocument>;
  },

  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }
    return response.json() as Promise<{ status: string; timestamp: string }>;
  },
};
