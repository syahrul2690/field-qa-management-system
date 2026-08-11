import axios from 'axios';
import { getAccessToken, refreshAccessToken } from './tokenRefresh';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // for refresh token cookie
});

// Request interceptor: attach access token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: on 401, refresh once and replay.
// The de-duplication lives in tokenRefresh so that the SSE client, which
// cannot use interceptors, shares the same in-flight promise.
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const token = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${token}`;
      return apiClient(original);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
