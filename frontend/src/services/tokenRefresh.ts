import axios from 'axios';

/**
 * Single-flight access-token refresh, shared by every transport.
 *
 * This has to be module-global rather than per-client. The chat assistant
 * streams over `fetch` and so cannot go through the axios interceptor; if it
 * carried its own refresh logic, a token expiring while both a normal request
 * and a stream were in flight would fire two concurrent refreshes. With
 * refresh-token rotation the second invalidates the first, and the user gets
 * bounced to the login page mid-conversation.
 */

let inFlight: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (!inFlight) {
    inFlight = axios
      .post('/api/auth/refresh', {}, { withCredentials: true })
      .then((res) => {
        const token = res.data?.data?.access_token as string | undefined;
        if (!token) throw new Error('Refresh response did not contain an access token');
        localStorage.setItem('access_token', token);
        return token;
      })
      .catch((err) => {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        throw err;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}
