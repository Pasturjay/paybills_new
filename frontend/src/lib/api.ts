const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/** Builds standard auth request headers */
const buildHeaders = (token?: string): Record<string, string> => {
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    return headers;
};

/**
 * Parses a failed response and throws an enriched Error.
 * Preserves backend-provided `code` and `missingFields` on the error object
 * so callers can handle specific error types (e.g. MISSING_PROFILE_INFO).
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

export const api = {
    async post(endpoint: string, data: any, token?: string) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: buildHeaders(token),
            body: JSON.stringify(data),
        });
        if (!res.ok) await handleError(res);
        return res.json();
    },

    async put(endpoint: string, data: any, token?: string) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: buildHeaders(token),
            body: JSON.stringify(data),
        });
        if (!res.ok) await handleError(res);
        return res.json();
    },

    async patch(endpoint: string, data: any, token?: string) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers: buildHeaders(token),
            body: JSON.stringify(data),
        });
        if (!res.ok) await handleError(res);
        return res.json();
    },

    async get(endpoint: string, token?: string) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: buildHeaders(token),
        });
        if (!res.ok) await handleError(res);
        return res.json();
    },

    async delete(endpoint: string, token?: string) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: buildHeaders(token),
        });
        if (!res.ok) await handleError(res);
        return res.json();
    },

    async getPurchaseContext(type: string, token?: string) {
        return this.get(`/purchase/context?type=${type}`, token);
    }
};
