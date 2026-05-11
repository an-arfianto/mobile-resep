import { colors } from "@/assets/color";
import { useRecipeStore } from "@/stores/recipeStore";
import { useAuthStore } from "@/stores/authStore";
import api from "@/services/api";
import { formatIngredient, formatDate } from "@/utils/recipe";
import type { Ingredient, RootStackParamList } from "@/types";
import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type RecipeDetailRouteProp = RouteProp<RootStackParamList, "RecipeDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RecipeDetailScreen: React.FC = () => {
    const route = useRoute<RecipeDetailRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { currentRecipe: recipe, loading, error, showRecipe } = useRecipeStore();
    const { isAdmin } = useAuthStore();

    useEffect(() => {
        if (isAdmin) {
            api.admin
                .getRecipe(route.params.recipeId)
                .then((res) => {
                    useRecipeStore.setState({
                        currentRecipe: res.data as any,
                        loading: false,
                        error: null,
                    });
                })
                .catch(() => {
                    useRecipeStore.setState({ error: "Resep tidak ditemukan", loading: false });
                });
        } else {
            showRecipe(route.params.recipeId);
        }
    }, [route.params.recipeId]);

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error || !recipe) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error ?? "Resep tidak ditemukan"}</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Kembali</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const ingredients = Array.isArray(recipe.ingredients)
        ? (recipe.ingredients as Ingredient[])
        : [];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>{recipe.name}</Text>
                    <View style={styles.categoryTag}>
                        <Text style={styles.categoryText}>{recipe.category}</Text>
                    </View>
                </View>

                {recipe.status === "pending" ? (
                    <View style={[styles.statusBanner, styles.statusBannerPending]}>
                        <Text style={[styles.statusBannerTitle, { color: colors.warning }]}>
                            Menunggu Review
                        </Text>
                        <Text style={[styles.statusBannerText, { color: colors.warning }]}>
                            Resep ini sedang menunggu persetujuan admin.
                        </Text>
                    </View>
                ) : null}
                {recipe.status === "rejected" ? (
                    <View style={[styles.statusBanner, styles.statusBannerRejected]}>
                        <Text style={[styles.statusBannerTitle, { color: colors.error }]}>
                            Resep Ditolak
                        </Text>
                        <Text style={[styles.statusBannerText, { color: colors.error }]}>
                            {recipe.rejection_reason ?? "Resep ini ditolak oleh admin."}
                        </Text>
                    </View>
                ) : null}

                <View style={styles.section}>
                    <View style={styles.descriptionBox}>
                        <View style={styles.metaBox}>
                            {recipe.creator_username && (
                                <View style={styles.metaRow}>
                                    <Text style={styles.metaLabel}>Oleh:</Text>
                                    <Text style={styles.metaValueBold}>
                                        {recipe.creator_username}
                                    </Text>
                                </View>
                            )}
                            {recipe.created_at && (
                                <View style={styles.metaRow}>
                                    <Text style={styles.metaLabel}>Dibuat:</Text>
                                    <Text style={styles.metaValue}>
                                        {formatDate(recipe.created_at)}
                                    </Text>
                                </View>
                            )}
                        </View>
                        {recipe.description && (
                            <Text style={styles.description}>{recipe.description}</Text>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bahan-bahan</Text>
                    <View style={styles.ingredientsBox}>
                        {ingredients.map((ingredient, index) => (
                            <View key={index} style={styles.ingredientItem}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.ingredientText}>
                                    {formatIngredient(ingredient)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Instruksi</Text>
                    <View style={styles.instructionsBox}>
                        <Text style={styles.instructionsText}>{recipe.instructions}</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        backgroundColor: colors.background,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    bold: {
        fontWeight: "bold",
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    title: {
        flex: 1,
        fontSize: 28,
        fontWeight: "bold",
        color: colors.textPrimary,
    },
    categoryTag: {
        backgroundColor: colors.secondarySoft,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    categoryText: {
        color: colors.secondary,
        fontSize: 14,
        fontWeight: "600",
    },
    metaBox: {
        backgroundColor: colors.background,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
        flexDirection: "column",
        gap: 6,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaLabel: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    metaValueBold: {
        fontSize: 13,
        fontWeight: "bold",
        color: colors.textPrimary,
    },
    metaValue: {
        fontSize: 13,
        color: colors.textPrimary,
    },
    descriptionBox: {
        backgroundColor: colors.surface,
        padding: 14,
        borderRadius: 12,
        shadowColor: colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    description: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 12,
    },
    ingredientsBox: {
        backgroundColor: colors.surface,
        padding: 14,
        borderRadius: 12,
        shadowColor: colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    ingredientItem: {
        flexDirection: "row",
        marginBottom: 4,
        alignItems: "flex-start",
    },
    bullet: {
        color: colors.textPrimary,
        marginRight: 8,
        fontSize: 16,
    },
    ingredientText: {
        flex: 1,
        fontSize: 14,
        color: colors.textPrimary,
        lineHeight: 20,
    },
    instructionsBox: {
        backgroundColor: colors.surface,
        padding: 14,
        borderRadius: 12,
        shadowColor: colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    instructionsText: {
        fontSize: 14,
        color: colors.textPrimary,
        lineHeight: 22,
    },
    statusBanner: {
        borderRadius: 10,
        padding: 14,
        marginBottom: 16,
    },
    statusBannerPending: {
        backgroundColor: colors.warningSoft,
    },
    statusBannerRejected: {
        backgroundColor: colors.errorSoft,
    },
    statusBannerTitle: {
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 4,
    },
    statusBannerText: {
        fontSize: 13,
        lineHeight: 18,
    },
    errorText: {
        color: colors.error,
        fontSize: 16,
        marginBottom: 16,
    },
    backButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: colors.textInverse,
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default RecipeDetailScreen;
