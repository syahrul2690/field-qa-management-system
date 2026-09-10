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
  consultantPics: (id: string) => apiClient.get(`/projects/${id}/consultant-pics`),
  consultantPicCandidates: (id: string) => apiClient.get(`/projects/${id}/consultant-pic-candidates`),
  assignConsultantPic: (id: string, consultantId: string) =>
    apiClient.post(`/projects/${id}/consultant-pics`, { consultant_id: consultantId }),
  removeConsultantPic: (id: string, consultantId: string) =>
    apiClient.delete(`/projects/${id}/consultant-pics/${consultantId}`),
  dashboard: (params?: Record<string, string>) =>
    apiClient.get('/projects/dashboard', { params }),
  dashboardExport: (params?: Record<string, string>) =>
    apiClient.get('/projects/dashboard/export', { params, responseType: 'blob' }),
  approvedDocuments: (id: string) =>
    apiClient.get(`/projects/${id}/approved-documents`),
  wmsMonitoring: (id: string, params?: Record<string, string>) =>
    apiClient.get(`/projects/${id}/wms-monitoring`, { params }),
};
