const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/** Builds standard auth request headers */
const buildHeaders = (token?: string): Record<string, string> => {
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    return headers;
};

/**
 * Attempt to refresh the access token using the HTTP-only refresh cookie.
 * Returns the new access token, or null if the refresh fails.
 */
const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include', // Send refresh token cookie
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (data.accessToken) {
            localStorage.setItem('token', data.accessToken);
            return data.accessToken;
        }
        return null;
    } catch {
        return null;
    }
};

/**
 * Parses a failed response and throws an enriched Error.
 */
const handleError = async (res: Response): Promise<never> => {
    let body: Record<string, any> = {};
    try { body = await res.json(); } catch { /* body may be empty */ }
    const err: any = new Error(body.error || body.message || 'Something went wrong');
    err.status = res.status;
    if (body.code) err.code = body.code;
    if (body.missingFields) err.missingFields = body.missingFields;
    throw err;
};

/**
 * Execute a fetch call with automatic token refresh on 401.
 */
const fetchWithAuth = async (
    url: string,
    options: RequestInit,
    token?: string
): Promise<Response> => {
    const res = await fetch(url, { ...options, headers: buildHeaders(token) });

    // If 401, try to refresh the token and retry once
    if (res.status === 401 && typeof window !== 'undefined') {
        const newToken = await refreshAccessToken();
        if (newToken) {
            return fetch(url, { ...options, headers: buildHeaders(newToken) });
        }
        // Refresh failed — clear session and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
    }

    return res;
};

export const api = {
    async post(endpoint: string, data: any, token?: string) {
        const res = await fetchWithAuth(`${API_URL}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(data),
        }, token);
        if (!res.ok) await handleError(res);
        return res.json();
    },

    async put(endpoint: string, data: any, token?: string) {
        const res = await fetchWithAuth(`${API_URL}${endpoint}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }, token);
        if (!res.ok) await handleError(res);
        return res.json();
    },

    async patch(endpoint: string, data: any, token?: string) {
        const res = await fetchWithAuth(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }, token);
        if (!res.ok) await handleError(res);
        return res.json();
    },

    async get(endpoint: string, token?: string) {
        const res = await fetchWithAuth(`${API_URL}${endpoint}`, {
            method: 'GET',
        }, token);
        if (!res.ok) await handleError(res);
        return res.json();
    },

    async delete(endpoint: string, token?: string) {
        const res = await fetchWithAuth(`${API_URL}${endpoint}`, {
            method: 'DELETE',
        }, token);
        if (!res.ok) await handleError(res);
        return res.json();
    },

    async getPurchaseContext(type: string, token?: string) {
        return this.get(`/purchase/context?type=${type}`, token);
    }
};
