const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
    async post(endpoint: string, data: any, token?: string) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
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
        return res.json();
    },

    async put(endpoint: string, data: any, token?: string) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
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

    async get(endpoint: string, token: string) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };

        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers,
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Something went wrong');
        }

        return res.json();
    }
};
