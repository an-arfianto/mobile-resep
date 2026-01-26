import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { Recipe, RootStackParamList, Ingredient } from "@/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RecipeCardProps {
    recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
    const navigation = useNavigation<NavigationProp>();

    const handlePress = () => {
        navigation.navigate("RecipeDetail", { recipeId: recipe.id });
    };

    // type checking untuk bahan
    const getIngredientsDisplay = (): string => {
        if (!recipe.ingredients) return "";

        // string
        if (typeof recipe.ingredients === "string") {
            return recipe.ingredients;
        }

        // array
        if (Array.isArray(recipe.ingredients)) {
            return recipe.ingredients
                .map((ing: Ingredient) => {
                    if (ing.quantity && ing.unit) {
                        return `${ing.quantity} ${ing.unit} ${ing.name}`;
                    } else if (ing.quantity) {
                        return `${ing.quantity} ${ing.name}`;
                    } else {
                        return ing.name;
                    }
                })
                .join(", ");
        }

        return "";
    };

    return (
        <TouchableOpacity style={styles.card} onPress={handlePress}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>🍽️</Text>
            </View>

            <Text style={styles.title}>{recipe.name}</Text>

            <View style={styles.tagContainer}>
                <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{recipe.category}</Text>
                </View>
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
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    iconContainer: {
        width: "100%",
        height: 120,
        backgroundColor: "#ef4444",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    icon: {
        fontSize: 48,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#111",
        marginBottom: 8,
    },
    tagContainer: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 8,
    },
    categoryTag: {
        backgroundColor: "#fee2e2",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        color: "#b91c1c",
        fontSize: 12,
        fontWeight: "600",
    },
    matchTag: {
        backgroundColor: "#dcfce7",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    matchText: {
        color: "#15803d",
        fontSize: 12,
        fontWeight: "600",
    },
    ingredients: {
        fontSize: 14,
        color: "#666",
        marginBottom: 12,
    },
    button: {
        backgroundColor: "#ef4444",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
});

export default RecipeCard;
