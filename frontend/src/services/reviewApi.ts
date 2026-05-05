import apiClient from './apiClient';

export const reviewApi = {
  submit: (documentId: string) => apiClient.post('/reviews', { document_id: documentId }),
  getByDocument: (documentId: string) => apiClient.get('/reviews', { params: { document_id: documentId } }),
  get: (reviewId: string) => apiClient.get(`/reviews/${reviewId}`),
  pending: () => apiClient.get('/reviews/pending'),
  addReview: (reviewId: string, data: unknown) => apiClient.post(`/reviews/${reviewId}/review`, data),
  check: (reviewId: string, data: unknown) => apiClient.post(`/reviews/${reviewId}/check`, data),
  approve: (reviewId: string, data: unknown) => apiClient.post(`/reviews/${reviewId}/approve`, data),
  downloadSheet: (reviewId: string, params?: { cs_date?: string; cs_status?: string }) =>
    apiClient.get(`/reviews/${reviewId}/comment-sheet`, { responseType: 'blob', params }),
  uploadAmsLetter: (
    reviewId: string,
    file: File,
    meta?: { ams_number?: string; ams_date?: string; ams_title?: string },
  ) => {
    const form = new FormData();
    form.append('ams_file', file);
    if (meta?.ams_number) form.append('ams_number', meta.ams_number);
    if (meta?.ams_date) form.append('ams_date', meta.ams_date);
    if (meta?.ams_title) form.append('ams_title', meta.ams_title);
    return apiClient.post(`/reviews/${reviewId}/ams-letter`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  assignTeam: (
    reviewId: string,
    data: { reviewer_id: string; checker_id?: string; approver_id?: string },
  ) => apiClient.post(`/reviews/${reviewId}/assign`, data),
  verifyQR: (hash: string) => apiClient.get(`/verify/${hash}`),
  notifications: () => apiClient.get('/reviews/notifications'),
  getCommentSheetItems: (reviewId: string) =>
    apiClient.get(`/reviews/${reviewId}/comment-sheet-items`),
  saveCommentSheetItems: (
    reviewId: string,
    items: Array<{ seq_no: number; pln_comment: string; contractor_response?: string }>,
  ) => apiClient.put(`/reviews/${reviewId}/comment-sheet-items`, { items }),
};
