import apiClient from './apiClient';

export const documentApi = {
  list: (boqItemId: string, section?: string) =>
    apiClient.get('/documents', { params: { boq_item_id: boqItemId, ...(section && { section }) } }),
  get: (id: string) => apiClient.get(`/documents/${id}`),
  history: (boqItemId: string, section: string, docNumber: string) =>
    apiClient.get('/documents/history', { params: { boq_item_id: boqItemId, section, doc_number: docNumber } }),
  upload: (data: FormData) =>
    apiClient.post('/documents', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  revise: (documentId: string, data: FormData) =>
    apiClient.post(`/documents/${documentId}/revisions`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
