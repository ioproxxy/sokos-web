/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Helper utility for making API requests with authentication headers and session tracking
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const userId = localStorage.getItem('sokos_user_id');
  if (userId) {
    init = init || {};
    const headers = new Headers(init.headers || {});
    if (!headers.has('X-Soko-User-Id')) {
      headers.set('X-Soko-User-Id', userId);
    }
    init.headers = headers;
  }

  const response = await fetch(input, init);

  const urlStr = typeof input === 'string' 
    ? input 
    : (input instanceof URL 
      ? input.toString() 
      : (input && typeof input === 'object' && 'url' in input ? (input as any).url : ''));

  if (response.ok && urlStr && urlStr.includes('/api/auth/')) {
    if (urlStr.includes('/logout')) {
      localStorage.removeItem('sokos_user_id');
    } else {
      try {
        const clone = response.clone();
        const data = await clone.json();
        if (data) {
          const userObj = data.user || data;
          if (userObj && typeof userObj.id === 'string') {
            localStorage.setItem('sokos_user_id', userObj.id);
          }
        }
      } catch (err) {
        // Safe fallback if JSON parsing fails
      }
    }
  }

  return response;
}

export function formatCurrency(amount: number): string {
  return "KES " + Number(amount).toLocaleString();
}

export function formatDate(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
