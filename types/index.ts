export interface User {
    id: number;
    username: string;
    role_id: number;
    role_name?: string;
    is_suspended: boolean;
    created_at?: string;
    recipe_count?: number;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface UserDetailResponse {
    success: boolean;
    message: string;
    data: User;
}

export interface UserListResponse {
    success: boolean;
    message: string;
    count?: number;
    data: User[];
}

export type RecipeStatus = "pending" | "approved" | "rejected";

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
    user_id?: number;
    creator_username: string;
    creator_is_suspended?: boolean;
    reviewer_username?: string | null;
    reviewed_by?: number | null;
    reviewed_at?: string | null;
    rejection_reason?: string | null;
    matched_count?: number;
    created_at: string;
    updated_at?: string;
}

export interface CreateRecipeData {
    name: string;
    category: string;
    description?: string;
    instructions: string;
    ingredients: Ingredient[];
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

export interface ProfileData extends User {
    recipe_count?: number;
    approved_count?: number;
    rejected_count?: number;
    pending_count?: number;
}

export interface ProfileResponse {
    success: boolean;
    data: ProfileData;
}

export interface AdminStats {
    totalUsers: number;
    totalRecipes: number;
    pendingRecipes: number;
    suspendedUsers: number;
    recipesByCategory: { category: string; count: number }[];
    recipesByStatus: {
        pending: number;
        approved: number;
        rejected: number;
    };
    usersByRole: { role_name: string; count: number }[];
}

export interface AdminStatsResponse {
    success: boolean;
    message: string;
    data: AdminStats;
}

export interface AdminRecipesResponse {
    success: boolean;
    message: string;
    count: number;
    data: Recipe[];
}

export interface MessageResponse {
    success: boolean;
    message: string;
}

export interface ApiError {
    message: string;
    status?: number;
}

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Home: undefined;
    Search: undefined;
    RecipeDetail: { recipeId: number };
    MyRecipes: undefined;
    CreateRecipe: undefined;
    EditRecipe: { recipeId: number };
    Profile: undefined;
    AdminDashboard: undefined;
    AdminUsers: undefined;
    AdminRecipes: undefined;
};
