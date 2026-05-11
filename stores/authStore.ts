import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/services/api";
import type { User, LoginCredentials, RegisterData } from "@/types";

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    register: (data: RegisterData) => Promise<boolean>;
    login: (data: LoginCredentials) => Promise<boolean>;
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
}

function extractError(err: unknown): string {
    if (typeof err === "object" && err !== null) {
        const e = err as any;
        if (e.response?.data?.message) return e.response.data.message;
        if (e.message) return e.message;
    }
    return "Terjadi kesalahan";
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    isAdmin: false,

    register: async (data) => {
        set({ loading: true, error: null });
        try {
            const response = await api.auth.register(data);
            const { token, user } = response.data;
            await AsyncStorage.setItem("token", token);
            set({ token, user, isAuthenticated: true, isAdmin: user.role_id === 1 });
            return true;
        } catch (err) {
            set({ error: extractError(err) });
            return false;
        } finally {
            set({ loading: false });
        }
    },

    login: async (data) => {
        set({ loading: true, error: null });
        try {
            const response = await api.auth.login(data);
            const { token, user } = response.data;

            if (user.is_suspended) {
                set({ error: "Akun Anda telah disuspend" });
                return false;
            }

            await AsyncStorage.setItem("token", token);
            set({ token, user, isAuthenticated: true, isAdmin: user.role_id === 1 });
            return true;
        } catch (err) {
            set({ error: extractError(err) });
            return false;
        } finally {
            set({ loading: false });
        }
    },

    checkAuth: async () => {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;
        try {
            const response = await api.auth.getCurrentUser();
            const user = response.data as User;

            if (user.is_suspended) {
                get().logout();
                return;
            }

            set({ user, token, isAuthenticated: true, isAdmin: user.role_id === 1 });
        } catch {
            get().logout();
        }
    },

    logout: async () => {
        await AsyncStorage.removeItem("token");
        set({ user: null, token: null, isAuthenticated: false, isAdmin: false, error: null });
    },
}));
