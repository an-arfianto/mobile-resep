import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import type { Ingredient, Recipe, RootStackParamList } from "@/types";

type RecipeDetailRouteProp = RouteProp<RootStackParamList, "RecipeDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RecipeDetailScreen: React.FC = () => {
    const route = useRoute<RecipeDetailRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { user } = useAuth();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [deleting, setDeleting] = useState<boolean>(false);

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

    const handleDelete = () => {
        Alert.alert("Hapus Resep", "Anda yakin ingin menghapus resep ini?", [
            { text: "Batal", style: "cancel" },
            {
                text: "Hapus",
                style: "destructive",
                onPress: async () => {
                    if (!recipe) return;
                    try {
                        setDeleting(true);
                        await api.recipes.delete(recipe.id);

                        // Show success message
                        Alert.alert("Success", "Resep telah dihapus", [
                            {
                                text: "OK",
                                onPress: () => {
                                    // Navigate back and the list will auto-refresh with useFocusEffect
                                    navigation.goBack();
                                },
                            },
                        ]);
                    } catch (err: any) {
                        Alert.alert("Error", err.message);
                        setDeleting(false);
                    }
                },
            },
        ]);
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#ef4444" />
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

    const ingredientsList = getIngredientsList();

    const canDelete = recipe.user_id === user?.id;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>🍽️</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>{recipe.name}</Text>
                    <View style={styles.categoryTag}>
                        <Text style={styles.categoryText}>{recipe.category}</Text>
                    </View>
                </View>

                {recipe.description && <Text style={styles.description}>{recipe.description}</Text>}

                {ingredientsList.map((ingredient: Ingredient, index: number) => (
                    <View key={index} style={styles.ingredientItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.ingredientText}>
                            {ingredient.quantity && ingredient.unit && (
                                <Text style={styles.bold}>
                                    {ingredient.quantity} {ingredient.unit}{" "}
                                </Text>
                            )}
                            {ingredient.name}
                        </Text>
                    </View>
                ))}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Instructions</Text>
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
        backgroundColor: "#f9fafb",
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    iconContainer: {
        width: "100%",
        height: 200,
        backgroundColor: "#ef4444",
        justifyContent: "center",
        alignItems: "center",
    },
    icon: {
        fontSize: 80,
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
        color: "#111",
    },
    categoryTag: {
        backgroundColor: "#fee2e2",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    categoryText: {
        color: "#b91c1c",
        fontSize: 14,
        fontWeight: "600",
    },
    description: {
        fontSize: 16,
        color: "#6b7280",
        marginBottom: 24,
        lineHeight: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#111",
        marginBottom: 12,
    },
    ingredientsBox: {
        backgroundColor: "#f9fafb",
        padding: 16,
        borderRadius: 12,
    },
    ingredientItem: {
        flexDirection: "row",
        marginBottom: 8,
    },
    bullet: {
        color: "#ef4444",
        marginRight: 8,
        fontSize: 16,
    },
    ingredientText: {
        flex: 1,
        fontSize: 14,
        color: "#374151",
    },
    instructionsBox: {
        backgroundColor: "#f9fafb",
        padding: 16,
        borderRadius: 12,
    },
    instructionsText: {
        fontSize: 14,
        color: "#374151",
        lineHeight: 22,
    },
    errorText: {
        color: "#dc2626",
        fontSize: 16,
        marginBottom: 16,
    },
    backButton: {
        backgroundColor: "#ef4444",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: "row",
        gap: 12,
        marginTop: 16,
    },
    editButton: {
        flex: 1,
        backgroundColor: "#1e40af",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    editButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: "#dc2626",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    deleteButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default RecipeDetailScreen;
