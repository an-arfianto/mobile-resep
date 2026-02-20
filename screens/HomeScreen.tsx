import { colors } from "@/assets/color";
import LoadMoreButton from "@/components/LoadMoreButton";
import RecipeCard from "@/components/RecipeCard";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import type { Recipe, RootStackParamList } from "@/types";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { isAuthenticated } = useAuth();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // pagination
    const [displayCount, setDisplayCount] = useState(10);
    const itemsPerPage = 10;

    const fetchRecipes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.recipes.getAll();
            setRecipes(Array.isArray(response.data) ? response.data : [response.data]);
            setDisplayCount(10);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchRecipes();
        setRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchRecipes();
        }, []),
    );

    const handleLoadMore = () => {
        setDisplayCount((prev) => Math.min(prev + itemsPerPage, recipes.length));
    };

    const displayedRecipes = recipes.slice(0, displayCount);

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.title}>🍳 Resep App</Text>
                    <Text style={styles.subtitle}>Pencarian resep masakan menggunakan Boolean Retrieval</Text>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("Search")}>
                        <Text style={styles.primaryButtonText}>Cari Resep</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.recipesSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Daftar Resep</Text>
                        <Text style={styles.recipeCount}>{recipes.length} resep</Text>
                    </View>

                    {loading && !refreshing ? (
                        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={fetchRecipes}>
                                <Text style={styles.retryButtonText}>Coba lagi</Text>
                            </TouchableOpacity>
                        </View>
                    ) : recipes.length > 0 ? (
                        <>
                            {displayedRecipes.map((recipe) => (
                                <RecipeCard key={recipe.id} recipe={recipe} />
                            ))}

                            <LoadMoreButton
                                currentItems={displayCount}
                                totalItems={recipes.length}
                                onLoadMore={handleLoadMore}
                                itemsPerPage={itemsPerPage}
                            />
                        </>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Tidak ada resep.</Text>
                            {isAuthenticated && (
                                <TouchableOpacity
                                    style={styles.primaryButton}
                                    onPress={() => navigation.navigate("CreateRecipe")}
                                >
                                    <Text style={styles.primaryButtonText}>Buat Resep</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
    },
    header: {
        alignItems: "center",
        padding: 24,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.textPrimary,
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: "center",
        marginBottom: 16,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    primaryButtonText: {
        color: colors.textInverse,
        fontWeight: "bold",
        fontSize: 15,
    },
    recipesSection: {
        padding: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.textPrimary,
    },
    recipeCount: {
        fontSize: 13,
        color: colors.textMuted,
    },
    loader: {
        marginTop: 40,
    },
    errorContainer: {
        alignItems: "center",
        marginTop: 40,
    },
    errorText: {
        color: colors.error,
        textAlign: "center",
        fontSize: 14,
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: colors.error,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: colors.textInverse,
        fontWeight: "600",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 40,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 15,
        color: colors.textPrimary,
        textAlign: "center",
        marginBottom: 20,
    },
});

export default HomeScreen;
