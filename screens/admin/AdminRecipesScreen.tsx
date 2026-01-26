import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Header from "@/components/Header";
import LoadMoreButton from "@/components/LoadMoreButton";
import api from "@/services/api";
import type { RootStackParamList } from "@/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AdminRecipesScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const [recipes, setRecipes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [displayCount, setDisplayCount] = useState(10);
    const itemsPerPage = 10;

    const fetchRecipes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.admin.getRecipes();
            setRecipes(response.data);
            setDisplayCount(10); // Reset to initial count
        } catch (err: any) {
            console.error("Error fetching recipes:", err);
            setError(err.message || "Failed to load recipes");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchRecipes();
        }, []),
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchRecipes();
        setRefreshing(false);
    }, []);

    const handleLoadMore = () => {
        setDisplayCount((prev) => Math.min(prev + itemsPerPage, recipes.length));
    };

    const deleteRecipe = (id: number, name: string) => {
        Alert.alert("Hapus Resep", `Anda yakin menghapus "${name}"?`, [
            { text: "Batal", style: "cancel" },
            {
                text: "Hapus",
                style: "destructive",
                onPress: async () => {
                    try {
                        await api.admin.deleteRecipe(id);
                        setRecipes(recipes.filter((r) => r.id !== id));
                        Alert.alert("Success", "Resep berhasil dihapus");
                    } catch (err: any) {
                        Alert.alert("Error", err.message || "Gagal menghapus resep");
                    }
                },
            },
        ]);
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.container}>
                <Header title="Kelola Resep" />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#dc2626" />
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Header title="Kelola Resep" />
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchRecipes}>
                        <Text style={styles.retryButtonText}>Coba lagi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const displayedRecipes = recipes.slice(0, displayCount);

    return (
        <View style={styles.container}>
            <Header title="Kelola Resep" />
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#dc2626"]}
                        tintColor="#dc2626"
                    />
                }
            >
                <View style={styles.headerInfo}>
                    <Text style={styles.totalText}>Total: {recipes.length} resep</Text>
                </View>

                {recipes.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📖</Text>
                        <Text style={styles.emptyText}>Tidak ada resep</Text>
                    </View>
                ) : (
                    <>
                        {displayedRecipes.map((recipe) => (
                            <View key={recipe.id} style={styles.recipeCard}>
                                <Text style={styles.recipeName}>{recipe.name}</Text>
                                <View style={styles.recipeInfo}>
                                    <View style={styles.categoryBadge}>
                                        <Text style={styles.categoryText}>{recipe.category}</Text>
                                    </View>
                                    <Text style={styles.authorText}>oleh {recipe.author}</Text>
                                </View>
                                {recipe.ingredients && (
                                    <Text style={styles.ingredients} numberOfLines={2}>
                                        {recipe.ingredients}
                                    </Text>
                                )}
                                <Text style={styles.dateText}>
                                    Dibuat: {new Date(recipe.created_at).toLocaleDateString()}
                                </Text>
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={styles.viewButton}
                                        onPress={() =>
                                            navigation.navigate("RecipeDetail", {
                                                recipeId: recipe.id,
                                            })
                                        }
                                    >
                                        <Text style={styles.viewButtonText}>Lihat</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => deleteRecipe(recipe.id, recipe.name)}
                                    >
                                        <Text style={styles.deleteButtonText}>Hapus</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        <LoadMoreButton
                            currentItems={displayCount}
                            totalItems={recipes.length}
                            onLoadMore={handleLoadMore}
                            itemsPerPage={itemsPerPage}
                        />
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    scrollContainer: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    headerInfo: {
        backgroundColor: "#dbeafe",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    totalText: {
        color: "#1e40af",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    recipeCard: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    recipeName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#111",
        marginBottom: 8,
    },
    recipeInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    categoryBadge: {
        backgroundColor: "#fed7aa",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        color: "#9a3412",
        fontSize: 12,
        fontWeight: "600",
    },
    authorText: {
        fontSize: 12,
        color: "#6b7280",
    },
    ingredients: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 8,
    },
    dateText: {
        fontSize: 12,
        color: "#9ca3af",
        marginBottom: 12,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 8,
    },
    viewButton: {
        flex: 1,
        backgroundColor: "#f3f4f6",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    viewButtonText: {
        color: "#374151",
        fontWeight: "600",
    },
    deleteButton: {
        flex: 1,
        backgroundColor: "#dc2626",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    deleteButtonText: {
        color: "#fff",
        fontWeight: "600",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 60,
        paddingHorizontal: 20,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: "#6b7280",
        textAlign: "center",
    },
    errorText: {
        color: "#dc2626",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: "#dc2626",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
});

export default AdminRecipesScreen;
