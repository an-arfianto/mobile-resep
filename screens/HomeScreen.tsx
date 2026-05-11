import { colors } from "@/assets/color";
import RecipeCard from "@/components/RecipeCard";
import { useAuthStore } from "@/stores/authStore";
import { useRecipeStore } from "@/stores/recipeStore";
import type { RootStackParamList } from "@/types";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { isAuthenticated } = useAuthStore();
    const { recipes, loading, error, showAllRecipes } = useRecipeStore();

    const [refreshing, setRefreshing] = useState(false);
    const [displayCount, setDisplayCount] = useState(10);

    const displayed = recipes.slice(0, displayCount);
    const hasMore = displayCount < recipes.length;

    useFocusEffect(
        useCallback(() => {
            showAllRecipes();
            setDisplayCount(10);
        }, []),
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await showAllRecipes();
        setRefreshing(false);
    }, []);

    const ListHeader = () => (
        <>
            <View style={styles.header}>
                <Text style={styles.title}>🍳 Resep App</Text>
                <Text style={styles.subtitle}>Pencarian resep masakan menggunakan Boolean Retrieval</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("Search")}>
                    <Text style={styles.primaryButtonText}>Cari Resep</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Daftar Resep</Text>
                <Text style={styles.recipeCount}>{recipes.length} resep</Text>
            </View>
        </>
    );

    const ListEmpty = () => {
        if (loading && !refreshing)
            return <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />;
        if (error)
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => showAllRecipes()}>
                        <Text style={styles.retryButtonText}>Coba lagi</Text>
                    </TouchableOpacity>
                </View>
            );
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Tidak ada resep.</Text>
                {isAuthenticated && (
                    <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("CreateRecipe")}>
                        <Text style={styles.primaryButtonText}>Buat Resep</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const ListFooter = () => {
        if (loading && !refreshing) return null;
        if (hasMore)
            return (
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Memuat {displayCount} dari {recipes.length} resep
                    </Text>
                    <ActivityIndicator color={colors.primary} style={styles.footerLoader} />
                </View>
            );
        return (
            <View style={styles.footer}>
                <Text style={styles.footerText}>Menampilkan semua {recipes.length} resep</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={displayed}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <RecipeCard recipe={item} />}
                onEndReached={() => {
                    if (hasMore) setDisplayCount((prev) => Math.min(prev + 10, recipes.length));
                }}
                onEndReachedThreshold={0.3}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                ListHeaderComponent={<ListHeader />}
                ListFooterComponent={<ListFooter />}
                ListEmptyComponent={<ListEmpty />}
                contentContainerStyle={styles.content}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    header: {
        alignItems: "center",
        padding: 24,
        marginHorizontal: -16,
        marginBottom: 16,
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
    footer: {
        alignItems: "center",
        paddingVertical: 20,
    },
    footerText: {
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: 8,
    },
    footerLoader: {
        marginTop: 4,
    },
});

export default HomeScreen;
