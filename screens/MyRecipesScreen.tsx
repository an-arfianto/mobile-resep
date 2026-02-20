import { colors } from "@/assets/color";
import Header from "@/components/Header";
import RecipeCardWithStatus from "@/components/RecipeCardWithStatus";
import api from "@/services/api";
import type { Recipe, RecipeStatus, RootStackParamList } from "@/types";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

    const filteredRecipes = statusFilter === "all" ? recipes : recipes.filter((r) => r.status === statusFilter);

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
            <Text style={[styles.filterButtonText, statusFilter === value && styles.filterButtonTextActive]}>
                {label}
            </Text>
            {count > 0 && (
                <View style={[styles.filterBadge, statusFilter === value && styles.filterBadgeActive]}>
                    <Text style={[styles.filterBadgeText, statusFilter === value && styles.filterBadgeTextActive]}>
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
                <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate("CreateRecipe")}>
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
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
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
                                {filteredRecipes.map((recipe) => (
                                    <RecipeCardWithStatus key={recipe.id} recipe={recipe} onDelete={fetchMyRecipes} />
                                ))}
                            </>
                        ) : (
                            <View style={styles.emptyFilterContainer}>
                                <Text style={styles.emptyFilterText}>Tidak ada resep.</Text>
                            </View>
                        )}
                    </>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Anda belum membuat resep.</Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => navigation.navigate("CreateRecipe")}
                        >
                            <Text style={styles.emptyButtonText}>Buat resep untuk pertama kali</Text>
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
        backgroundColor: colors.background,
    },
    actionBar: {
        backgroundColor: colors.surface,
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        alignItems: "flex-end",
    },
    createButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    createButtonText: {
        color: colors.textInverse,
        fontWeight: "600",
        fontSize: 14,
    },
    filterContainer: {
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
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
        backgroundColor: colors.surface,
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: colors.primary,
    },
    filterButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    filterButtonTextActive: {
        color: colors.textInverse,
    },
    filterBadge: {
        backgroundColor: colors.overlay,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 6,
    },
    filterBadgeActive: {
        backgroundColor: colors.overlay,
    },
    filterBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    filterBadgeTextActive: {
        color: colors.textPrimary,
    },
    content: {
        flex: 1,
        padding: 16,
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
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: colors.textInverse,
        fontWeight: "600",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 60,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textPrimary,
        marginBottom: 20,
        textAlign: "center",
    },
    emptyButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: colors.textInverse,
        fontWeight: "bold",
        fontSize: 16,
    },
    emptyFilterContainer: {
        alignItems: "center",
        marginTop: 60,
    },
    emptyFilterText: {
        fontSize: 15,
        color: colors.textPrimary,
        textAlign: "center",
    },
});

export default MyRecipesScreen;
