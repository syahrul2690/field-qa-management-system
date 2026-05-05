import apiClient from './apiClient';

export const projectApi = {
  list: (params?: Record<string, string>) => apiClient.get('/projects', { params }),
  get: (id: string) => apiClient.get(`/projects/${id}`),
  create: (data: unknown) => apiClient.post('/projects', data),
  update: (id: string, data: unknown) => apiClient.patch(`/projects/${id}`, data),
  listAmendments: (id: string) => apiClient.get(`/projects/${id}/amendments`),
  createAmendment: (id: string, data: unknown) => apiClient.post(`/projects/${id}/amendments`, data),
  assignVendor: (id: string, vendorInstitutionId: string) =>
    apiClient.post(`/projects/${id}/vendors`, { vendor_institution_id: vendorInstitutionId }),
  removeVendor: (id: string, vendorId: string) =>
    apiClient.delete(`/projects/${id}/vendors/${vendorId}`),
  dashboard: (params?: Record<string, string>) =>
    apiClient.get('/projects/dashboard', { params }),
  approvedDocuments: (id: string) =>
    apiClient.get(`/projects/${id}/approved-documents`),
};
