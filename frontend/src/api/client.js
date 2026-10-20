let csrfToken = null;

export function setCsrfToken(token) {
  if (token) {
    csrfToken = token;
  }
}

export function clearCsrfToken() {
  csrfToken = null;
}

export async function getCsrfToken(force = false) {
  if (csrfToken && !force) return csrfToken;
  try {
    const res = await fetch('/api/csrf-token', {
      credentials: 'include',
      cache: 'no-store'
    });
    const data = await res.json();
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch (err) {
    console.error('Failed to obtain CSRF token:', err);
    return null;
  }
}

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
    csrfToken = freshHeaderToken;
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
      csrfToken = null;
      await getCsrfToken(true);
      return apiRequest(endpoint, options, true);
    }

    throw new Error(errorMsg);
  }

  // If response payload contains a new csrfToken, update client cache
  if (data && data.csrfToken) {
    csrfToken = data.csrfToken;
  }

  return data;
}
