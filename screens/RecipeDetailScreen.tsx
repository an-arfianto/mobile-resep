import { colors } from "@/assets/color";
import api from "@/services/api";
import type { Ingredient, Recipe, RootStackParamList } from "@/types";
import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type RecipeDetailRouteProp = RouteProp<RootStackParamList, "RecipeDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RecipeDetailScreen: React.FC = () => {
    const route = useRoute<RecipeDetailRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchRecipe();
    }, []);

    const fetchRecipe = async () => {
        try {
            setLoading(true);
            const response = await api.recipes.getById(route.params.recipeId);
            setRecipe(response.data as Recipe);
        } catch (err: any) {
            Alert.alert("Error", err.message, [
                {
                    text: "Kembali",
                    onPress: () => navigation.goBack(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!recipe) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Resep tidak ditemukan</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Kembali</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const getIngredientsList = (): Ingredient[] => {
        if (!recipe) return [];

        // If ingredients is already an array
        if (Array.isArray(recipe.ingredients)) {
            return recipe.ingredients;
        }

        // If ingredients is a string
        if (typeof recipe.ingredients === "string") {
            return recipe.ingredients.split(",").map((item: string) => ({
                name: item.trim(),
                quantity: null,
                unit: null,
            }));
        }

        return [];
    };

    /**
     * Format ingredient display text
     * Handles all combinations of quantity/unit being present or null
     */
    const formatIngredientText = (ingredient: Ingredient): string => {
        const parts: string[] = [];

        // Add quantity if exists
        if (ingredient.quantity !== null && ingredient.quantity !== undefined) {
            parts.push(ingredient.quantity.toString());
        }

        // Add unit if exists
        if (ingredient.unit !== null && ingredient.unit !== undefined && ingredient.unit.trim() !== "") {
            parts.push(ingredient.unit);
        }

        // Add ingredient name
        parts.push(ingredient.name);

        return parts.join(" ");
    };

    const ingredientsList = getIngredientsList();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>{recipe.name}</Text>
                    <View style={styles.categoryTag}>
                        <Text style={styles.categoryText}>{recipe.category}</Text>
                    </View>
                </View>

                {recipe.description && <Text style={styles.description}>{recipe.description}</Text>}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bahan-bahan</Text>
                    <View style={styles.ingredientsBox}>
                        {ingredientsList.map((ingredient: Ingredient, index: number) => {
                            const hasQuantityOrUnit =
                                (ingredient.quantity !== null && ingredient.quantity !== undefined) ||
                                (ingredient.unit !== null &&
                                    ingredient.unit !== undefined &&
                                    ingredient.unit.trim() !== "");

                            return (
                                <View key={index} style={styles.ingredientItem}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.ingredientText}>
                                        {hasQuantityOrUnit && (
                                            <>
                                                <Text style={styles.bold}>
                                                    {ingredient.quantity !== null && ingredient.quantity !== undefined
                                                        ? `${ingredient.quantity} `
                                                        : ""}
                                                    {ingredient.unit !== null &&
                                                    ingredient.unit !== undefined &&
                                                    ingredient.unit.trim() !== ""
                                                        ? `${ingredient.unit} `
                                                        : ""}
                                                </Text>
                                            </>
                                        )}
                                        {ingredient.name}
                                    </Text>
                                </View>
                            );
                        })}
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
    description: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 24,
        lineHeight: 24,
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
        marginBottom: 8,
        alignItems: "flex-start",
    },
    bullet: {
        color: colors.textPrimary,
        marginRight: 8,
        fontSize: 16,
        // marginTop: 2,
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
