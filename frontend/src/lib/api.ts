const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Retrieves the current Firebase ID Token from local storage
const getFirebaseToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
};

export const api = {
    async post(endpoint: string, data: any, token?: string) {
        const authToken = token || getFirebaseToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Something went wrong');
        }

        return res.json();
    },

    async put(endpoint: string, data: any, token?: string) {
        const authToken = token || getFirebaseToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Something went wrong');
        }

        return res.json();
    },

    async get(endpoint: string, token?: string) {
        const authToken = token || getFirebaseToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers,
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Something went wrong');
        }

        return res.json();
    },

    async delete(endpoint: string, token?: string) {
        const authToken = token || getFirebaseToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Something went wrong');
        }

        return res.json();
    },

    async getPurchaseContext(type: string, token?: string) {
        return this.get(`/purchase/context?type=${type}`, token);
    }
};
