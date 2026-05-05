import apiClient from './apiClient';

export const boqApi = {
  getTree: (projectId: string) => apiClient.get(`/projects/${projectId}/boq`),
  getItem: (itemId: string) => apiClient.get(`/boq/${itemId}`),
  getChildren: (itemId: string) => apiClient.get(`/boq/${itemId}/children`),
  upload: (projectId: string, file: File) => {
    const fd = new FormData();
    fd.append('boq_file', file);
    return apiClient.post(`/projects/${projectId}/boq/upload`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  clear: (projectId: string) => apiClient.delete(`/projects/${projectId}/boq`),
};
