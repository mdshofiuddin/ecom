import {
  getCsrfToken,
  setCsrfToken,
  clearCsrfToken,
  refreshCsrfToken
} from './csrfClient.js';

export { getCsrfToken, setCsrfToken, clearCsrfToken, refreshCsrfToken };

export async function apiRequest(endpoint, options = {}, isRetry = false) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  // Add CSRF token for state-modifying HTTP methods
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const token = await getCsrfToken(isRetry);
    if (token) {
      headers['x-csrf-token'] = token;
    }
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include'
  });

  // Automatically sync fresh CSRF token from server response headers if present
  const freshHeaderToken = response.headers.get('x-csrf-token');
  if (freshHeaderToken) {
    setCsrfToken(freshHeaderToken);
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = (data && data.error) || (typeof data === 'string' ? data : 'Request failed');

    // Self-healing CSRF: If a CSRF mismatch occurs, fetch fresh token and auto-retry once
    const isCsrfError =
      response.status === 403 &&
      (errorMsg.toLowerCase().includes('csrf') ||
       errorMsg.toLowerCase().includes('cross-site') ||
       errorMsg.toLowerCase().includes('token'));

    if (isCsrfError && !isRetry) {
      console.warn('CSRF token mismatch detected. Fetching fresh token and retrying...');
      clearCsrfToken();
      await getCsrfToken(true);
      return apiRequest(endpoint, options, true);
    }

    throw new Error(errorMsg);
  }

  // If response payload contains a new csrfToken, update client cache
  if (data && data.csrfToken) {
    setCsrfToken(data.csrfToken);
  }

  return data;
}
