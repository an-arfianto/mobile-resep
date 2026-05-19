import type {
    AdminRecipesResponse,
    AdminStatsResponse,
    AuthResponse,
    CreateRecipeData,
    LoginCredentials,
    MessageResponse,
    ProfileResponse,
    RecipeResponse,
    RegisterData,
    SearchCriteria,
    SearchResponse,
    UserDetailResponse,
    UserListResponse,
} from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem("token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    (error) => {
        if (axios.isCancel(error)) {
            return Promise.reject({ message: "cancelled", cancelled: true });
        }
        const message = error.response?.data?.message || "Terjadi kesalahan";
        return Promise.reject({ message, status: error.response?.status });
    },
);

export default {
    auth: {
        register: (data: RegisterData): Promise<AuthResponse> => api.post("/auth/register", data),

        login: (data: LoginCredentials): Promise<AuthResponse> => api.post("/auth/login", data),

        getCurrentUser: (signal?: AbortSignal): Promise<UserDetailResponse> =>
            api.get("/auth/me", { signal }),
    },

    recipes: {
        getAll: (params?: Record<string, string>, signal?: AbortSignal): Promise<RecipeResponse> =>
            api.get("/recipes", { params, signal }),

        getMy: (signal?: AbortSignal): Promise<RecipeResponse> =>
            api.get("/recipes/my", { signal }),

        getById: (id: number, signal?: AbortSignal): Promise<RecipeResponse> =>
            api.get(`/recipes/${id}`, { signal }),

        getMyRecipeById: (id: number, signal?: AbortSignal): Promise<RecipeResponse> =>
            api.get(`/recipes/${id}/edit`, { signal }),

        search: (data: SearchCriteria): Promise<SearchResponse> => api.post("/search", data),

        create: (data: CreateRecipeData): Promise<RecipeResponse> => api.post("/recipes", data),

        update: (id: number, data: CreateRecipeData): Promise<RecipeResponse> =>
            api.put(`/recipes/${id}`, data),

        delete: (id: number): Promise<MessageResponse> => api.delete(`/recipes/${id}`),
    },

    profile: {
        getProfile: (signal?: AbortSignal): Promise<ProfileResponse> =>
            api.get("/profile", { signal }),

        updateProfile: (username: string): Promise<MessageResponse> =>
            api.put("/profile", { username }),

        updatePassword: (currentPassword: string, newPassword: string): Promise<MessageResponse> =>
            api.put("/profile/password", { currentPassword, newPassword }),
    },

    admin: {
        getStats: (signal?: AbortSignal): Promise<AdminStatsResponse> =>
            api.get("/admin/stats", { signal }),

        getUsers: (signal?: AbortSignal): Promise<UserListResponse> =>
            api.get("/admin/users", { signal }),

        suspendUser: (userId: number): Promise<MessageResponse> =>
            api.put(`/admin/users/${userId}/suspend`),

        unsuspendUser: (userId: number): Promise<MessageResponse> =>
            api.put(`/admin/users/${userId}/unsuspend`),

        deleteUser: (userId: number): Promise<MessageResponse> =>
            api.delete(`/admin/users/${userId}`),

        getRecipe: (id: number, signal?: AbortSignal): Promise<RecipeResponse> =>
            api.get(`/admin/recipes/${id}`, { signal }),

        getRecipes: (signal?: AbortSignal): Promise<AdminRecipesResponse> =>
            api.get("/admin/recipes", { signal }),

        getPendingRecipes: (signal?: AbortSignal): Promise<AdminRecipesResponse> =>
            api.get("/admin/recipes/pending", { signal }),

        getRecipesByStatus: (
            status: "pending" | "approved" | "rejected",
            signal?: AbortSignal,
        ): Promise<AdminRecipesResponse> =>
            api.get("/admin/recipes/status", { params: { status }, signal }),

        approveRecipe: (id: number): Promise<RecipeResponse> =>
            api.put(`/admin/recipes/${id}/approve`),

        rejectRecipe: (id: number, reason?: string): Promise<RecipeResponse> =>
            api.put(`/admin/recipes/${id}/reject`, { reason }),

        deleteRecipe: (id: number): Promise<MessageResponse> => api.delete(`/admin/recipes/${id}`),
    },
};
