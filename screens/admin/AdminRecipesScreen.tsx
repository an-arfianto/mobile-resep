import { colors } from "@/assets/color";
import Header from "@/components/Header";
import LoadMoreButton from "@/components/LoadMoreButton";
import api from "@/services/api";
import type { RootStackParamList } from "@/types";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AdminRecipesScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const [recipes, setRecipes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [displayCount, setDisplayCount] = useState(10);
    const itemsPerPage = 10;

    const fetchRecipes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.admin.getRecipes();
            setRecipes(response.data);
            setDisplayCount(10);
        } catch (err: any) {
            if (err.cancelled) return;
            setError(err.message || "Failed to load recipes");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const controller = new AbortController();
            fetchRecipes();
            return () => controller.abort();
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
        Alert.alert("Hapus Resep", `Anda yakin ingin menghapus "${name}"?`, [
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
                    <ActivityIndicator size="large" color={colors.primary} />
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

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
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                {recipes.length === 0 ? (
                    <View style={styles.emptyContainer}>
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
                                <Text style={styles.dateText}>Dibuat: {formatDate(recipe.created_at)}</Text>
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
        backgroundColor: colors.background,
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
    recipeCard: {
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    recipeName: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 8,
    },
    recipeInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    categoryBadge: {
        backgroundColor: colors.primarySoft,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: "600",
    },
    authorText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    ingredients: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    dateText: {
        fontSize: 12,
        color: colors.textMuted,
        marginBottom: 12,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 8,
    },
    viewButton: {
        flex: 1,
        backgroundColor: colors.secondarySoft,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    viewButtonText: {
        color: colors.secondary,
        fontWeight: "600",
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
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 60,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textPrimary,
        textAlign: "center",
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: colors.error,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: colors.textInverse,
        fontWeight: "600",
        fontSize: 16,
    },
});

export default AdminRecipesScreen;
