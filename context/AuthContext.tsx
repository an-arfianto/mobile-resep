import api from "@/services/api";
import type { ApiError, LoginCredentials, RegisterData, User } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    register: (data: RegisterData) => Promise<boolean>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const isAuthenticated = !!token && !!user;

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async (): Promise<void> => {
        try {
            const storedToken = await AsyncStorage.getItem("token");
            if (storedToken) {
                setToken(storedToken);
                const response = await api.auth.getCurrentUser();
                setUser(response.data);
            }
        } catch (err) {
            await logout();
        }
    };

    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.auth.login(credentials);
            setToken(response.data.token);
            setUser(response.data.user);
            await AsyncStorage.setItem("token", response.data.token);
            return true;
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: RegisterData): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.auth.register(data);
            setToken(response.data.token);
            setUser(response.data.user);
            await AsyncStorage.setItem("token", response.data.token);
            return true;
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        setUser(null);
        setToken(null);
        await AsyncStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider
            value={{ user, token, loading, error, isAuthenticated, login, register, logout, checkAuth }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
