import type {
    AuthResponse,
    CreateRecipeData,
    LoginCredentials,
    ModerationRecipesResponse,
    ModerationStatsResponse,
    RecipeResponse,
    RegisterData,
    SearchCriteria,
    SearchResponse,
    User,
} from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const API_URL = "http://10.248.77.216:3000/api"; // Local IP
// const API_URL = "https://watercolour-suzi-unexpansive.ngrok-free.dev/api"; // Public IP

const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// request interceptor
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem("token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Response interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    (error) => {
        if (axios.isCancel(error)) {
            // request batal
            return Promise.reject({ message: "cancelled", cancelled: true });
        }
        const message = error.response?.data?.message || "Terjadi kesalahan";
        return Promise.reject({ message, status: error.response?.status });
    },
);

export default {
    auth: {
        register: (data: RegisterData): Promise<AuthResponse> => api.post("/users/register", data),

        login: (data: LoginCredentials): Promise<AuthResponse> => api.post("/users/login", data),

        getCurrentUser: (
            signal?: AbortSignal,
        ): Promise<{
            success: boolean;
            message: string;
            data: User;
        }> => api.get("/users/me", { signal }),
    },

    recipes: {
        getAll: (params?: Record<string, any>, signal?: AbortSignal): Promise<RecipeResponse> =>
            api.get("/recipes", { params, signal }),

        getMy: (signal?: AbortSignal): Promise<RecipeResponse> => api.get("/recipes/my", { signal }),

        getById: (id: number, signal?: AbortSignal): Promise<RecipeResponse> => api.get(`/recipes/${id}`, { signal }),

        search: (data: SearchCriteria): Promise<SearchResponse> => api.post("/search", data),

        create: (data: CreateRecipeData): Promise<RecipeResponse> => api.post("/recipes", data),

        update: (id: number, data: CreateRecipeData): Promise<RecipeResponse> => api.put(`/recipes/${id}`, data),

        delete: (id: number): Promise<{ success: boolean; message: string }> => api.delete(`/recipes/${id}`),
    },

    moderation: {
        getStats: (signal?: AbortSignal): Promise<ModerationStatsResponse> => api.get("/moderation/stats", { signal }),

        getPending: (signal?: AbortSignal): Promise<ModerationRecipesResponse> =>
            api.get("/moderation/pending", { signal }),

        getByStatus: (
            status: "pending" | "approved" | "rejected",
            signal?: AbortSignal,
        ): Promise<ModerationRecipesResponse> => api.get("/moderation/recipes", { params: { status }, signal }),

        getAllRecipes: (signal?: AbortSignal): Promise<ModerationRecipesResponse> =>
            api.get("/moderation/recipes/all", { signal }),

        getRecipeById: (id: number, signal?: AbortSignal): Promise<RecipeResponse> =>
            api.get(`/moderation/recipes/${id}`, { signal }),

        approve: (id: number): Promise<RecipeResponse> => api.put(`/moderation/recipes/${id}/approve`),

        reject: (id: number, reason?: string): Promise<RecipeResponse> =>
            api.put(`/moderation/recipes/${id}/reject`, { reason }),
    },

    profile: {
        getProfile: (signal?: AbortSignal): Promise<{ success: boolean; data: any }> => api.get("/profile", { signal }),

        updateProfile: (username: string): Promise<{ success: boolean; message: string; data: any }> =>
            api.put("/profile", { username }),

        updatePassword: (
            currentPassword: string,
            newPassword: string,
        ): Promise<{ success: boolean; message: string }> =>
            api.put("/profile/password", { currentPassword, newPassword }),
    },

    admin: {
        getStats: (signal?: AbortSignal): Promise<{ success: boolean; message: string; data: any }> =>
            api.get("/admin/stats", { signal }),

        getUsers: (signal?: AbortSignal): Promise<{ success: boolean; message: string; count: number; data: any[] }> =>
            api.get("/admin/users", { signal }),

        getRecipes: (
            signal?: AbortSignal,
        ): Promise<{
            success: boolean;
            message: string;
            count: number;
            data: any[];
        }> => api.get("/admin/recipes", { signal }),

        deleteRecipe: (id: number): Promise<{ success: boolean; message: string }> =>
            api.delete(`/admin/recipes/${id}`),

        promoteUser: (userId: number): Promise<{ success: boolean; message: string }> =>
            api.put(`/admin/users/${userId}/promote`),

        demoteUser: (userId: number): Promise<{ success: boolean; message: string }> =>
            api.put(`/admin/users/${userId}/demote`),

        deleteUser: (userId: number): Promise<{ success: boolean; message: string }> =>
            api.delete(`/admin/users/${userId}`),
    },
};
