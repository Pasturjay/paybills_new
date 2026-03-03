
import { useState, useEffect } from 'react';

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        setIsAuthenticated(!!token);
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
            }
        }
        setIsLoading(false);
    }, []);

    const logout = async () => {
        try {
            // Call backend to revoke refresh token in DB
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include', // send cookies so backend can revoke refresh token
            });
        } catch (e) {
            // Non-fatal: even if this fails, we clear local state
            console.error('Logout API call failed', e);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setUser(null);
            window.location.href = '/auth/login';
        }
    };

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

    return { isAuthenticated, user, isAdmin, isLoading, logout };
}
