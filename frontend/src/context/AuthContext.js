import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ CORREGIDO: useEffect con cleanup para prevenir memory leaks
    useEffect(() => {
        let mounted = true;

        const loadUser = () => {
            try {
                const currentUser = authService.getCurrentUser();
                if (mounted) {
                    setUser(currentUser);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error cargando usuario:', error);
                if (mounted) {
                    setUser(null);
                    setLoading(false);
                }
            }
        };

        loadUser();

        // ✅ Cleanup function para prevenir memory leaks
        return () => {
            mounted = false;
        };
    }, []);

    const login = async (username, password) => {
        try {
            const data = await authService.login(username, password);
            setUser(data.user);
            return data;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.2rem'
            }}>
                Cargando...
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};