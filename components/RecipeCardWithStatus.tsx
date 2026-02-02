import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { Recipe, Ingredient, RootStackParamList } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import api from "@/services/api";

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

            {/* tag alasan resep ditolak */}
            {recipe.status === "rejected" && recipe.rejection_reason && (
                <View style={styles.rejectionAlert}>
                    <Text style={styles.rejectionLabel}>Alasan:</Text>
                    <Text style={styles.rejectionText}>{recipe.rejection_reason}</Text>
                </View>
            )}

            {/* Action Buttons */}
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
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
        color: "#111827",
        marginRight: 8,
    },
    categoryContainer: {
        marginBottom: 12,
    },
    categoryBadge: {
        backgroundColor: "#fed7aa",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: "flex-start",
    },
    categoryText: {
        color: "#9a3412",
        fontSize: 12,
        fontWeight: "600",
    },
    ingredients: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 8,
        lineHeight: 20,
    },
    date: {
        fontSize: 12,
        color: "#9ca3af",
        marginBottom: 12,
    },
    rejectionAlert: {
        backgroundColor: "#fee2e2",
        borderLeftWidth: 3,
        borderLeftColor: "#dc2626",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    rejectionLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: "#991b1b",
        marginBottom: 4,
    },
    rejectionText: {
        fontSize: 13,
        color: "#dc2626",
        lineHeight: 18,
    },
    actions: {
        flexDirection: "row",
        gap: 8,
    },
    editButton: {
        flex: 1,
        backgroundColor: "#dbeafe",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    editButtonText: {
        color: "#1e40af",
        fontWeight: "600",
        fontSize: 14,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: "#fee2e2",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    deleteButtonText: {
        color: "#dc2626",
        fontWeight: "600",
        fontSize: 14,
    },
});

export default RecipeCardWithStatus;
