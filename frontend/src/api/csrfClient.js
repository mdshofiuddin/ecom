let csrfToken = null;

export function getCachedCsrfToken() {
  return csrfToken;
}

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

export async function refreshCsrfToken() {
  return getCsrfToken(true);
}
