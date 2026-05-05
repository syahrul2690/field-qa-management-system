import apiClient from './apiClient';

export const authApi = {
  register: (data: RegisterPayload) => apiClient.post('/auth/register', data),
  login: (data: LoginPayload) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
  updateProfile: (data: { name?: string; phone?: string; role?: string }) =>
    apiClient.patch('/auth/me', data),
  listInstitutions: (type?: string) =>
    apiClient.get('/institutions', { params: type ? { type } : {} }),
  listUnits: (institutionId: string) =>
    apiClient.get(`/institutions/${institutionId}/units`),
  listPeers: (role?: string) =>
    apiClient.get('/auth/peers', { params: role ? { role } : {} }),
};

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role: string;
  institution_id: string;
  unit_id: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
