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
import Header from "@/components/Header";
import RecipeCardWithStatus from "@/components/RecipeCardWithStatus";
import api from "@/services/api";
import type { Recipe, RootStackParamList, RecipeStatus } from "@/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MyRecipesScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<"all" | RecipeStatus>("all");

    const fetchMyRecipes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.recipes.getMy();
            const myRecipes = Array.isArray(response.data) ? response.data : [response.data];
            setRecipes(myRecipes);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchMyRecipes();
        setRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchMyRecipes();
        }, []),
    );

    const filteredRecipes =
        statusFilter === "all" ? recipes : recipes.filter((r) => r.status === statusFilter);

    const counts = {
        all: recipes.length,
        approved: recipes.filter((r) => r.status === "approved").length,
        pending: recipes.filter((r) => r.status === "pending").length,
        rejected: recipes.filter((r) => r.status === "rejected").length,
    };

    const FilterButton = ({ label, value, count }: any) => (
        <TouchableOpacity
            style={[styles.filterButton, statusFilter === value && styles.filterButtonActive]}
            onPress={() => setStatusFilter(value)}
        >
            <Text
                style={[
                    styles.filterButtonText,
                    statusFilter === value && styles.filterButtonTextActive,
                ]}
            >
                {label}
            </Text>
            {count > 0 && (
                <View
                    style={[styles.filterBadge, statusFilter === value && styles.filterBadgeActive]}
                >
                    <Text
                        style={[
                            styles.filterBadgeText,
                            statusFilter === value && styles.filterBadgeTextActive,
                        ]}
                    >
                        {count}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header title="Resep Saya" />

            {/* Create Recipe Button */}
            <View style={styles.actionBar}>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigation.navigate("CreateRecipe")}
                >
                    <Text style={styles.createButtonText}>+ Tambah Resep</Text>
                </TouchableOpacity>
            </View>

            {/* Status Filter */}
            {recipes.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterContainer}
                    contentContainerStyle={styles.filterContent}
                >
                    <FilterButton label="Semua" value="all" count={counts.all} />
                    <FilterButton label="Disetujui" value="approved" count={counts.approved} />
                    <FilterButton label="Pending" value="pending" count={counts.pending} />
                    <FilterButton label="Ditolak" value="rejected" count={counts.rejected} />
                </ScrollView>
            )}

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
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#ef4444" style={styles.loader} />
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={fetchMyRecipes}>
                            <Text style={styles.retryButtonText}>Coba lagi</Text>
                        </TouchableOpacity>
                    </View>
                ) : recipes.length > 0 ? (
                    <>
                        {filteredRecipes.length > 0 ? (
                            <>
                                <View style={styles.infoContainer}>
                                    <Text style={styles.infoText}>
                                        {filteredRecipes.length} resep
                                    </Text>
                                </View>
                                {filteredRecipes.map((recipe) => (
                                    <RecipeCardWithStatus
                                        key={recipe.id}
                                        recipe={recipe}
                                        onDelete={fetchMyRecipes}
                                    />
                                ))}
                            </>
                        ) : (
                            <View style={styles.emptyFilterContainer}>
                                <Text style={styles.emptyFilterIcon}>🔍</Text>
                                <Text style={styles.emptyFilterText}>Tidak ada resep.</Text>
                            </View>
                        )}
                    </>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📖</Text>
                        <Text style={styles.emptyText}>Anda belum membuat resep.</Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => navigation.navigate("CreateRecipe")}
                        >
                            <Text style={styles.emptyButtonText}>
                                Buat resep untuk pertama kali
                            </Text>
                        </TouchableOpacity>
                    </View>
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
    actionBar: {
        backgroundColor: "#fff",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        alignItems: "flex-end",
    },
    createButton: {
        backgroundColor: "#ef4444",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    createButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    filterContainer: {
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        maxHeight: 60,
    },
    filterContent: {
        padding: 12,
        gap: 8,
    },
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 18,
        backgroundColor: "#f3f4f6",
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: "#ef4444",
    },
    filterButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6b7280",
    },
    filterButtonTextActive: {
        color: "#fff",
    },
    filterBadge: {
        backgroundColor: "#d1d5db",
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 6,
    },
    filterBadgeActive: {
        backgroundColor: "#991b1b",
    },
    filterBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#374151",
    },
    filterBadgeTextActive: {
        color: "#fff",
    },
    content: {
        flex: 1,
        padding: 16,
    },
    infoContainer: {
        backgroundColor: "#dbeafe",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    infoText: {
        color: "#1e40af",
        fontSize: 14,
        fontWeight: "500",
        textAlign: "center",
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
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#fff",
        fontWeight: "600",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: "#6b7280",
        marginBottom: 20,
        textAlign: "center",
    },
    emptyButton: {
        backgroundColor: "#ef4444",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    emptyFilterContainer: {
        alignItems: "center",
        marginTop: 60,
    },
    emptyFilterIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyFilterText: {
        fontSize: 15,
        color: "#6b7280",
        textAlign: "center",
    },
});

export default MyRecipesScreen;
