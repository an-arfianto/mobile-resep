export interface User {
    id: number;
    username: string;
    role_id: number;
    role_name?: string;
    created_at?: string;
}

export interface Ingredient {
    name: string;
    quantity?: string | null;
    unit?: string | null;
    display?: string;
}

export interface Recipe {
    id: number;
    name: string;
    category: string;
    status?: RecipeStatus;
    description?: string;
    instructions?: string;
    ingredients: Ingredient[] | string;
    ingredientsText?: string;
    user_id?: number;
    creator_username: string;
    rejection_reason?: string;
    matched_count?: number;
    created_at: string;
    updated_at?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData extends LoginCredentials {
    role_id: number;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface RecipeResponse {
    success: boolean;
    message: string;
    data: Recipe | Recipe[];
    count?: number;
}

export interface SearchCriteria {
    operator: "AND" | "OR" | "NOT";
    ingredients: string[];
    excludedIngredients?: string[];
}

export interface SearchResponse {
    success: boolean;
    message: string;
    operator: string;
    searchedIngredients: string[];
    excludedIngredients?: string[];
    count: number;
    data: Recipe[];
}

export interface CreateRecipeData {
    name: string;
    category: string;
    description?: string;
    instructions: string;
    ingredients: Ingredient[];
}

export type RecipeStatus = "pending" | "approved" | "rejected";

export interface ModerationRecipe {
    id: number;
    name: string;
    category: string;
    status: RecipeStatus;
    created_at: string;
    user_id: number;
    creator_username: string;
    ingredients: string;
    description?: string;
    instructions?: string;
    reviewed_by?: number | null;
    reviewed_at?: string | null;
    reviewer_username?: string | null;
    rejection_reason?: string | null;
}

export interface ModerationStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export interface ModerationStatsResponse {
    success: boolean;
    data: ModerationStats;
}

export interface ModerationRecipesResponse {
    success: boolean;
    count: number;
    status?: RecipeStatus;
    data: ModerationRecipe[];
}

export interface ApiError {
    message: string;
    status?: number;
}

export type RootStackParamList = {
    // Auth screens
    Login: undefined;
    Register: undefined;

    // User screens
    Home: undefined;
    Search: undefined;
    RecipeDetail: { recipeId: number };
    MyRecipes: undefined;
    CreateRecipe: undefined;
    EditRecipe: { recipeId: number };
    Profile: undefined;

    // Admin screens
    AdminDashboard: undefined;
    AdminUsers: undefined;
    AdminRecipes: undefined;

    // Moderation screens
    ModerationDashboard: undefined;
    ModerationPending: undefined;
    ModerationReviewed: undefined;
    ModerationAll: undefined;
    ModerationRecipeDetail: { recipeId: number };
};
