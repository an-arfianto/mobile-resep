import { colors } from "@/assets/color";
import StatusBadge from "@/components/StatusBadge";
import api from "@/services/api";
import type { Ingredient, Recipe, RootStackParamList } from "@/types";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface RecipeCardWithStatusProps {
    recipe: Recipe;
    onDelete?: () => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RecipeCardWithStatus: React.FC<RecipeCardWithStatusProps> = ({ recipe, onDelete }) => {
    const navigation = useNavigation<NavigationProp>();

    const handleDelete = () => {
        Alert.alert("Hapus Resep", `Anda yakin menghapus "${recipe.name}"?`, [
            { text: "Batal", style: "cancel" },
            {
                text: "Hapus",
                style: "destructive",
                onPress: async () => {
                    try {
                        await api.recipes.delete(recipe.id);
                        if (onDelete) {
                            onDelete();
                        }
                        Alert.alert("Success", "Resep berhasil terhapus");
                    } catch (err: any) {
                        Alert.alert("Error", err.message);
                    }
                },
            },
        ]);
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("RecipeDetail", { recipeId: recipe.id })}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={2}>
                    {recipe.name}
                </Text>
                <StatusBadge status={recipe.status || "pending"} />
            </View>

            <View style={styles.categoryContainer}>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{recipe.category}</Text>
                </View>
            </View>

            <Text style={styles.ingredients} numberOfLines={2}>
                {getIngredientsDisplay()}
            </Text>

            <Text style={styles.date}>{formatDate(recipe.created_at)}</Text>

            {recipe.status === "rejected" && recipe.rejection_reason && (
                <View style={styles.rejectionAlert}>
                    <Text style={styles.rejectionLabel}>Alasan:</Text>
                    <Text style={styles.rejectionText}>{recipe.rejection_reason}</Text>
                </View>
            )}

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate("EditRecipe", { recipeId: recipe.id });
                    }}
                >
                    <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        handleDelete();
                    }}
                >
                    <Text style={styles.deleteButtonText}>Hapus</Text>
                </TouchableOpacity>
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
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginRight: 8,
    },
    categoryContainer: {
        marginBottom: 12,
    },
    categoryBadge: {
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
    ingredients: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
        lineHeight: 20,
    },
    date: {
        fontSize: 12,
        color: colors.textMuted,
        marginBottom: 12,
    },
    rejectionAlert: {
        backgroundColor: colors.errorSoft,
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    rejectionLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: colors.error,
        marginBottom: 4,
    },
    rejectionText: {
        fontSize: 13,
        color: colors.error,
        lineHeight: 18,
    },
    actions: {
        flexDirection: "row",
        gap: 8,
    },
    editButton: {
        flex: 1,
        backgroundColor: colors.successSoft,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    editButtonText: {
        color: colors.success,
        fontWeight: "600",
        fontSize: 14,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: colors.errorSoft,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    deleteButtonText: {
        color: colors.error,
        fontWeight: "600",
        fontSize: 14,
    },
});

export default React.memo(RecipeCardWithStatus);
