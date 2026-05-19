import { create } from "zustand";
import api from "@/services/api";
import type {
    Recipe,
    SearchCriteria,
    SearchResponse,
    CreateRecipeData,
    RecipeResponse,
} from "@/types";

interface RecipeState {
    recipes: Recipe[];
    myRecipes: Recipe[];
    currentRecipe: Recipe | null;
    loading: boolean;
    error: string | null;
    showAllRecipes: (filters?: Record<string, string>) => Promise<void>;
    showMyRecipes: () => Promise<void>;
    showRecipe: (id: number) => Promise<void>;
    showMyRecipe: (id: number) => Promise<void>;
    searchRecipes: (data: SearchCriteria) => Promise<SearchResponse | null>;
    createRecipe: (data: CreateRecipeData) => Promise<RecipeResponse | null>;
    updateRecipe: (id: number, data: CreateRecipeData) => Promise<RecipeResponse | null>;
    deleteRecipe: (id: number) => Promise<boolean>;
}

function extractError(err: unknown): string {
    if (typeof err === "object" && err !== null) {
        const e = err as any;
        if (e.response?.data?.message) return e.response.data.message;
        if (e.message) return e.message;
    }
    return "Terjadi kesalahan";
}

async function withLoading<T>(
    set: (state: Partial<RecipeState>) => void,
    fn: () => Promise<T>,
): Promise<T | null> {
    set({ loading: true, error: null });
    try {
        return await fn();
    } catch (err) {
        set({ error: extractError(err) });
        return null;
    } finally {
        set({ loading: false });
    }
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
    recipes: [],
    myRecipes: [],
    currentRecipe: null,
    loading: false,
    error: null,

    showAllRecipes: async (filters = {}) => {
        await withLoading(set, async () => {
            const response = await api.recipes.getAll(filters);
            set({ recipes: Array.isArray(response.data) ? response.data : [response.data] });
        });
    },

    showMyRecipes: async () => {
        await withLoading(set, async () => {
            const response = await api.recipes.getMy();
            set({ myRecipes: Array.isArray(response.data) ? response.data : [response.data] });
        });
    },

    showRecipe: async (id) => {
        await withLoading(set, async () => {
            const response = await api.recipes.getById(id);
            set({ currentRecipe: response.data as Recipe });
        });
    },

    showMyRecipe: async (id) => {
        await withLoading(set, async () => {
            const response = await api.recipes.getMyRecipeById(id);
            set({ currentRecipe: response.data as Recipe });
        });
    },

    searchRecipes: async (data) => {
        return withLoading(set, async () => {
            return await api.recipes.search(data);
        });
    },

    createRecipe: async (data) => {
        return withLoading(set, () => api.recipes.create(data));
    },

    updateRecipe: async (id, data) => {
        return withLoading(set, () => api.recipes.update(id, data));
    },

    deleteRecipe: async (id) => {
        const result = await withLoading(set, async () => {
            await api.recipes.delete(id);
            return true;
        });

        if (result) {
            const { recipes, myRecipes, currentRecipe } = get();
            set({
                recipes: recipes.filter((r) => r.id !== id),
                myRecipes: myRecipes.filter((r) => r.id !== id),
                currentRecipe: currentRecipe?.id === id ? null : currentRecipe,
            });
        }

        return result ?? false;
    },
}));
