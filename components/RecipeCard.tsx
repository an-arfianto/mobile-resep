import { colors } from "@/assets/color";
import type { Ingredient, Recipe, RootStackParamList } from "@/types";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RecipeCardProps {
    recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
    const navigation = useNavigation<NavigationProp>();

    const handlePress = () => {
        navigation.navigate("RecipeDetail", { recipeId: recipe.id });
    };

    const formatIngredient = (ing: Ingredient): string => {
        const parts: string[] = [];

        if (ing.quantity !== null && ing.quantity !== undefined) {
            parts.push(ing.quantity.toString());
        }

        if (ing.unit !== null && ing.unit !== undefined && ing.unit.trim() !== "") {
            parts.push(ing.unit);
        }

        parts.push(ing.name);

        return parts.join(" ");
    };

    const getIngredientsDisplay = (): string => {
        if (!recipe.ingredients) return "";

        if (typeof recipe.ingredients === "string") {
            return recipe.ingredients;
        }

        if (Array.isArray(recipe.ingredients)) {
            return recipe.ingredients.map((ing: Ingredient) => formatIngredient(ing)).join(", ");
        }

        return "";
    };

    return (
        <TouchableOpacity style={styles.card} onPress={handlePress}>
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={2}>
                    {recipe.name}
                </Text>
                <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{recipe.category}</Text>
                </View>
            </View>

            <View style={styles.tagContainer}>
                {recipe.creator_username && (
                    <View style={styles.creatorContainer}>
                        <Text style={styles.creatorText}>Oleh: {recipe.creator_username}</Text>
                    </View>
                )}

                {recipe.matched_count !== undefined && recipe.matched_count !== null && (
                    <View style={styles.matchTag}>
                        <Text style={styles.matchText}>{recipe.matched_count} bahan sama</Text>
                    </View>
                )}
            </View>

            <Text style={styles.ingredients} numberOfLines={2}>
                {getIngredientsDisplay()}
            </Text>

            <View style={styles.button}>
                <Text style={styles.buttonText}>Lihat Resep</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        gap: 8,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 8,
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontWeight: "bold",
        color: colors.textPrimary,
        lineHeight: 24,
    },
    categoryTag: {
        backgroundColor: colors.secondarySoft,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
    categoryText: {
        color: colors.secondary,
        fontSize: 12,
        fontWeight: "600",
    },
    tagContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
    },
    creatorContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    creatorText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    matchTag: {
        backgroundColor: colors.successSoft,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    matchText: {
        color: colors.success,
        fontSize: 12,
        fontWeight: "600",
    },
    ingredients: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        flex: 1,
    },
    button: {
        backgroundColor: colors.primarySoft,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 4,
    },
    buttonText: {
        color: colors.primary,
        fontWeight: "bold",
        fontSize: 14,
    },
});

export default React.memo(RecipeCard);
