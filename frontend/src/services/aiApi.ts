import apiClient from './apiClient';

export const aiApi = {
  getProjectSummary: (projectId: string, refresh = false) =>
    apiClient.get(`/ai/projects/${projectId}/summary`, {
      params: refresh ? { refresh: 'true' } : undefined,
    }),

  getDocumentAnalysis: (documentId: string) =>
    apiClient.get(`/ai/documents/${documentId}/analysis`),
};
