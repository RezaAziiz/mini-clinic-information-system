import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Saat aplikasi dimuat, cek apakah ada user di localStorage
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            if (storedUser && token) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Gagal membaca storage", error);
            try {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            } catch(e) {}
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { accessToken, user: userData } = response.data;
            
            // Simpan ke storage
            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Set state
            setUser(userData);
            toast.success(`Selamat datang kembali, ${userData.role}!`);
            return { success: true };
        } catch (error) {
            const message = error.message || 'Gagal login, periksa kembali email & password';
            toast.error(message);
            return { success: false, message };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            // Abaikan error saat logout (bisa jadi token sudah expired)
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            toast.success('Berhasil logout');
        }
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
