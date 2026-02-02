import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import RecipeCard from "@/components/RecipeCard";
import LoadMoreButton from "@/components/LoadMoreButton";
import api from "@/services/api";
import type { Recipe, RootStackParamList } from "@/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { isAuthenticated } = useAuth();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [displayCount, setDisplayCount] = useState(12);
    const itemsPerPage = 12;

    const fetchRecipes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.recipes.getAll();
            setRecipes(Array.isArray(response.data) ? response.data : [response.data]);
            setDisplayCount(12); // Reset to initial count
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
            <Header title="Resep App" />

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#ef4444"]}
                        tintColor="#ef4444"
                    />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Resep App</Text>
                    <Text style={styles.subtitle}>
                        Pencarian resep masakan menggunakan Boolean Retrieval
                    </Text>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate("Search")}
                    >
                        <Text style={styles.primaryButtonText}>Cari Resep</Text>
                    </TouchableOpacity>
                </View>

                {isAuthenticated && (
                    <View style={styles.quickActions}>
                        <Text style={styles.quickActionsTitle}>Menu</Text>
                        <View style={styles.buttonGrid}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => navigation.navigate("MyRecipes")}
                            >
                                <Text style={styles.actionButtonIcon}>📖</Text>
                                <Text style={styles.actionButtonText}>Resep Saya</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => navigation.navigate("CreateRecipe")}
                            >
                                <Text style={styles.actionButtonIcon}>➕</Text>
                                <Text style={styles.actionButtonText}>Buat Resep</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={styles.recipesSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Resep Terbaru</Text>
                        <Text style={styles.recipeCount}>{recipes.length} resep</Text>
                    </View>

                    {loading && !refreshing ? (
                        <ActivityIndicator size="large" color="#ef4444" style={styles.loader} />
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
                            <Text style={styles.emptyIcon}>📖</Text>
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
        backgroundColor: "#f9fafb",
    },
    content: {
        flex: 1,
    },
    header: {
        alignItems: "center",
        padding: 24,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#111",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
        marginBottom: 16,
    },
    primaryButton: {
        backgroundColor: "#ef4444",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    primaryButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 15,
    },
    quickActions: {
        padding: 16,
        backgroundColor: "#fff",
        marginTop: 12,
        marginHorizontal: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    quickActionsTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111",
        marginBottom: 12,
    },
    buttonGrid: {
        flexDirection: "row",
        gap: 12,
    },
    actionButton: {
        flex: 1,
        backgroundColor: "#f9fafb",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    actionButtonIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#374151",
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
        color: "#111",
    },
    recipeCount: {
        fontSize: 13,
        color: "#6b7280",
    },
    loader: {
        marginTop: 40,
    },
    errorContainer: {
        alignItems: "center",
        marginTop: 40,
    },
    errorText: {
        color: "#dc2626",
        textAlign: "center",
        fontSize: 14,
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: "#ef4444",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#fff",
        fontWeight: "600",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 40,
        paddingHorizontal: 20,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 15,
        color: "#6b7280",
        textAlign: "center",
        marginBottom: 20,
    },
});

export default HomeScreen;
