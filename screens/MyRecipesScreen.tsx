import { colors } from "@/assets/color";
import Header from "@/components/Header";
import RecipeCardWithStatus from "@/components/RecipeCardWithStatus";
import { useRecipeStore } from "@/stores/recipeStore";
import type { RecipeStatus, RootStackParamList } from "@/types";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MyRecipesScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { myRecipes, loading, error, showMyRecipes, deleteRecipe } = useRecipeStore();

    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState<"all" | RecipeStatus>("all");
    const [displayCount, setDisplayCount] = useState(10);

    useFocusEffect(
        useCallback(() => {
            showMyRecipes();
        }, []),
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await showMyRecipes();
        setRefreshing(false);
    }, []);

    const handleFilterChange = (value: "all" | RecipeStatus) => {
        setStatusFilter(value);
        setDisplayCount(10);
    };

    const handleDelete = async (id: number) => {
        await deleteRecipe(id);
    };

    const filtered =
        statusFilter === "all" ? myRecipes : myRecipes.filter((r) => r.status === statusFilter);

    const displayed = filtered.slice(0, displayCount);
    const hasMore = displayCount < filtered.length;

    const counts = {
        all: myRecipes.length,
        approved: myRecipes.filter((r) => r.status === "approved").length,
        pending: myRecipes.filter((r) => r.status === "pending").length,
        rejected: myRecipes.filter((r) => r.status === "rejected").length,
    };

    const FilterButton = ({
        label,
        value,
        count,
    }: {
        label: string;
        value: "all" | RecipeStatus;
        count: number;
    }) => (
        <TouchableOpacity
            style={[styles.filterButton, statusFilter === value && styles.filterButtonActive]}
            onPress={() => handleFilterChange(value)}
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

    const ListEmpty = () => {
        if (loading && !refreshing) {
            return <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />;
        }
        if (error) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={showMyRecipes}>
                        <Text style={styles.retryButtonText}>Coba lagi</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        if (myRecipes.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Anda belum membuat resep.</Text>
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={() => navigation.navigate("CreateRecipe")}
                    >
                        <Text style={styles.emptyButtonText}>Buat resep pertama</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <View style={styles.emptyFilterContainer}>
                <Text style={styles.emptyFilterText}>Tidak ada resep dengan filter ini.</Text>
            </View>
        );
    };

    const ListFooter = () => {
        if (loading && !refreshing) return null;
        if (hasMore) {
            return (
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Memuat {displayCount} dari {filtered.length} resep
                    </Text>
                    <ActivityIndicator color={colors.primary} style={styles.footerLoader} />
                </View>
            );
        }
        return (
            <View style={styles.footer}>
                <Text style={styles.footerText}>Menampilkan semua {filtered.length} resep</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Header title="Resep Saya" />

            <View style={styles.actionBar}>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigation.navigate("CreateRecipe")}
                >
                    <Text style={styles.createButtonText}>+ Tambah Resep</Text>
                </TouchableOpacity>
            </View>

            {myRecipes.length > 0 && (
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

            <FlatList
                data={displayed}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <RecipeCardWithStatus recipe={item} onDelete={() => handleDelete(item.id)} />
                )}
                onEndReached={() => {
                    if (hasMore) setDisplayCount((prev) => Math.min(prev + 10, filtered.length));
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
                ListEmptyComponent={<ListEmpty />}
                ListFooterComponent={<ListFooter />}
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
        padding: 16,
        flexGrow: 1,
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
    footer: {
        alignItems: "center",
        paddingVertical: 20,
    },
    footerText: {
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: 4,
    },
    footerLoader: {
        marginTop: 4,
    },
});

export default MyRecipesScreen;
